-- Paid API access layer: API subscriptions, hashed API keys, per-key rate /
-- burst / concurrency limits, monthly quota, request logs and abuse events.
--
-- Also closes direct access to public.daily_panchangam for the anon and
-- authenticated roles: Panchangam data is served only through the Next.js
-- backend (service role). BEFORE running this, make sure the deployment has
-- SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) set — the server no
-- longer falls back to the publishable key.
--
-- Does NOT change any Panchangam data or columns. Idempotent.

-- ---------------------------------------------------------------------------
-- 0. Panchangam data: backend-only
-- ---------------------------------------------------------------------------
-- `date` is already the primary key (unique B-tree), which serves both
-- `date = ?` and `date between ? and ?` lookups — no extra index is needed.
alter table public.daily_panchangam enable row level security;
revoke all on public.daily_panchangam from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 1. API subscriptions (separate from the website Free/Pro subscription)
-- ---------------------------------------------------------------------------
create table if not exists public.api_subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null unique references auth.users (id) on delete cascade,
  status                   text not null
                             check (status in ('active', 'cancelled', 'expired', 'payment_failed')),
  provider                 text check (provider in ('mock', 'razorpay')),
  provider_subscription_id text unique,
  provider_payment_id      text,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

drop trigger if exists api_subscriptions_set_updated_at on public.api_subscriptions;
create trigger api_subscriptions_set_updated_at
  before update on public.api_subscriptions
  for each row execute function public.set_updated_at();

-- Same rules as website Pro (lib/billing/access-rules.ts):
--   active    → allowed until current_period_end (or open-ended if null)
--   cancelled → allowed until current_period_end
--   expired / payment_failed → never
create or replace function public.api_is_entitled(
  p_status text, p_period_end timestamptz, p_now timestamptz
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when p_status = 'active' then p_period_end is null or p_period_end > p_now
    when p_status = 'cancelled' then p_period_end is not null and p_period_end > p_now
    else false
  end;
$$;

-- ---------------------------------------------------------------------------
-- 2. API keys — only a SHA-256 hash of the secret is stored
-- ---------------------------------------------------------------------------
create table if not exists public.api_keys (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  name           text not null check (char_length(name) between 1 and 60),
  key_prefix     text not null check (char_length(key_prefix) between 8 and 24),
  key_hash       text not null unique check (key_hash ~ '^[0-9a-f]{64}$'),
  created_at     timestamptz not null default now(),
  last_used_at   timestamptz,
  revoked_at     timestamptz,
  revoked_reason text check (revoked_reason in ('user', 'security', 'admin'))
);

create index if not exists api_keys_user_active_idx
  on public.api_keys (user_id) where revoked_at is null;

-- ---------------------------------------------------------------------------
-- 3. Per-key limiter state (server only)
-- ---------------------------------------------------------------------------
create table if not exists public.api_key_state (
  api_key_id         uuid primary key references public.api_keys (id) on delete cascade,
  sec_window         timestamptz,
  sec_count          integer not null default 0,
  min_window         timestamptz,
  min_count          integer not null default 0,
  rejected_window    timestamptz,
  rejected_count     integer not null default 0,
  throttled_until    timestamptz,
  last_anomaly_check timestamptz
);

-- In-flight requests, for the concurrency limit. Rows are deleted when the
-- request finishes; rows left behind by a crashed instance expire after the
-- request timeout, so a slot can never leak permanently.
create table if not exists public.api_inflight (
  request_id uuid primary key,
  api_key_id uuid not null references public.api_keys (id) on delete cascade,
  started_at timestamptz not null default now()
);

create index if not exists api_inflight_key_idx on public.api_inflight (api_key_id, started_at);

-- ---------------------------------------------------------------------------
-- 4. Quota usage per billing period (kept long-term for billing/analytics)
-- ---------------------------------------------------------------------------
create table if not exists public.api_usage_periods (
  user_id      uuid not null references auth.users (id) on delete cascade,
  period_start timestamptz not null,
  period_end   timestamptz not null,
  quota        integer not null,
  used         integer not null default 0 check (used >= 0),
  updated_at   timestamptz not null default now(),
  primary key (user_id, period_start)
);

-- ---------------------------------------------------------------------------
-- 5. Request logs (detailed, pruned after the retention period) and events
-- ---------------------------------------------------------------------------
create table if not exists public.api_request_logs (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  api_key_id   uuid references public.api_keys (id) on delete set null,
  user_id      uuid references auth.users (id) on delete set null,
  key_prefix   text,
  endpoint     text not null,
  status       smallint not null,
  error_code   text,
  response_ms  integer,
  cache_status text check (cache_status in ('hit', 'miss', 'coalesced', 'none')),
  ip_hash      text,
  country      text,
  user_agent   text
);

create index if not exists api_request_logs_key_time_idx on public.api_request_logs (api_key_id, created_at desc);
create index if not exists api_request_logs_user_time_idx on public.api_request_logs (user_id, created_at desc);
create index if not exists api_request_logs_time_idx on public.api_request_logs (created_at);

create table if not exists public.api_key_events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  api_key_id uuid references public.api_keys (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in (
               'suspicious_ip_spread', 'suspicious_country_spread', 'sustained_rate_limiting')),
  details    jsonb not null default '{}'::jsonb
);

create index if not exists api_key_events_user_time_idx on public.api_key_events (user_id, created_at desc);
create index if not exists api_key_events_key_kind_idx on public.api_key_events (api_key_id, kind, created_at desc);

-- ---------------------------------------------------------------------------
-- 6. Row Level Security and privileges
-- ---------------------------------------------------------------------------
alter table public.api_subscriptions enable row level security;
alter table public.api_keys enable row level security;
alter table public.api_key_state enable row level security;
alter table public.api_inflight enable row level security;
alter table public.api_usage_periods enable row level security;
alter table public.api_request_logs enable row level security;
alter table public.api_key_events enable row level security;

revoke all on public.api_subscriptions, public.api_keys, public.api_key_state, public.api_inflight,
  public.api_usage_periods, public.api_request_logs, public.api_key_events
  from anon, authenticated;

-- Signed-in users can read their own rows (dashboard). They never write:
-- keys, subscriptions and usage are written only by the server.
grant select on public.api_subscriptions to authenticated;
grant select (id, user_id, name, key_prefix, created_at, last_used_at, revoked_at, revoked_reason)
  on public.api_keys to authenticated;
grant select on public.api_usage_periods to authenticated;
grant select (id, created_at, api_key_id, user_id, key_prefix, endpoint, status, error_code, response_ms)
  on public.api_request_logs to authenticated;
grant select on public.api_key_events to authenticated;

do $$
declare
  t text;
begin
  foreach t in array array['api_subscriptions', 'api_keys', 'api_usage_periods', 'api_request_logs', 'api_key_events']
  loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = t and policyname = 'Users can read their own rows'
    ) then
      execute format(
        'create policy "Users can read their own rows" on public.%I for select to authenticated using ((select auth.uid()) = user_id)',
        t
      );
    end if;
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- 7. api_authorize: one atomic round trip per API request
--
-- key → not revoked → active API subscription → burst limit → per-minute
-- limit → concurrency limit → reserve one unit of monthly quota.
-- Limits are passed in by the server so environment config stays the single
-- source of truth. Only the per-key state row is locked, so different keys
-- never wait on each other.
-- ---------------------------------------------------------------------------
create or replace function public.api_authorize(
  p_key_hash         text,
  p_request_id       uuid,
  p_quota            integer,
  p_per_second       integer,
  p_per_minute       integer,
  p_max_concurrent   integer,
  p_slot_ttl_seconds integer,
  p_log              jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now        timestamptz := clock_timestamp();
  v_key        record;
  v_sub        record;
  v_state      public.api_key_state%rowtype;
  v_sec        timestamptz := date_trunc('second', v_now);
  v_min        timestamptz := date_trunc('minute', v_now);
  v_per_second integer := p_per_second;
  v_per_minute integer := p_per_minute;
  v_sec_count  integer;
  v_min_count  integer;
  v_inflight   integer;
  v_start      timestamptz;
  v_end        timestamptz;
  v_used       integer;
  v_error      text;
  v_status     integer;
  v_retry      integer;
begin
  select k.id, k.user_id, k.key_prefix, k.revoked_at, k.last_used_at
    into v_key
    from public.api_keys k
   where k.key_hash = p_key_hash;

  if not found or v_key.revoked_at is not null then
    return jsonb_build_object('ok', false, 'error', 'invalid_api_key', 'status', 401);
  end if;

  select s.status, s.current_period_start, s.current_period_end
    into v_sub
    from public.api_subscriptions s
   where s.user_id = v_key.user_id;

  if not found or not public.api_is_entitled(v_sub.status, v_sub.current_period_end, v_now) then
    v_error := 'api_access_required'; v_status := 403; v_retry := null;
  end if;

  -- Per-key lock: serialises this key's own requests only.
  insert into public.api_key_state (api_key_id) values (v_key.id) on conflict do nothing;
  select * into v_state from public.api_key_state where api_key_id = v_key.id for update;

  if v_error is null then
    -- Temporarily tightened after an anomaly (see api_finish).
    if v_state.throttled_until is not null and v_state.throttled_until > v_now then
      v_per_second := greatest(1, p_per_second / 2);
      v_per_minute := greatest(1, p_per_minute / 2);
    end if;

    v_sec_count := case when v_state.sec_window = v_sec then v_state.sec_count else 0 end;
    v_min_count := case when v_state.min_window = v_min then v_state.min_count else 0 end;

    if v_sec_count >= v_per_second then
      v_error := 'rate_limit_exceeded'; v_status := 429; v_retry := 1;
    elsif v_min_count >= v_per_minute then
      v_error := 'rate_limit_exceeded'; v_status := 429;
      v_retry := greatest(1, ceil(extract(epoch from (v_min + interval '1 minute' - v_now)))::integer);
    end if;
  end if;

  if v_error is null then
    delete from public.api_inflight
     where api_key_id = v_key.id
       and started_at < v_now - make_interval(secs => p_slot_ttl_seconds);
    select count(*) into v_inflight from public.api_inflight where api_key_id = v_key.id;
    if v_inflight >= p_max_concurrent then
      v_error := 'concurrency_limit_exceeded'; v_status := 429; v_retry := 1;
    end if;
  end if;

  if v_error is null then
    -- Billing period: the subscription's period, or the calendar month (UTC).
    if v_sub.current_period_start is not null and v_sub.current_period_end is not null
       and v_sub.current_period_start <= v_now then
      v_start := v_sub.current_period_start;
      v_end := v_sub.current_period_end;
    else
      v_start := date_trunc('month', v_now at time zone 'UTC') at time zone 'UTC';
      v_end := v_start + interval '1 month';
    end if;

    insert into public.api_usage_periods (user_id, period_start, period_end, quota)
    values (v_key.user_id, v_start, v_end, p_quota)
    on conflict (user_id, period_start) do nothing;

    -- Reserve one unit atomically; refunded by api_finish if the request fails.
    update public.api_usage_periods
       set used = used + 1, quota = p_quota, updated_at = v_now
     where user_id = v_key.user_id and period_start = v_start and used < p_quota
    returning used into v_used;

    if not found then
      v_error := 'monthly_quota_exceeded'; v_status := 429;
      v_retry := greatest(1, ceil(extract(epoch from (v_end - v_now)))::integer);
    end if;
  end if;

  if v_error is not null then
    -- Count rejections per hour; persistent hammering is flagged once an hour.
    update public.api_key_state
       set rejected_window = date_trunc('hour', v_now),
           rejected_count = case when rejected_window = date_trunc('hour', v_now) then rejected_count + 1 else 1 end
     where api_key_id = v_key.id
    returning rejected_count into v_used;

    if v_status = 429 and v_used = coalesce((p_log ->> 'sustained_rejections_per_hour')::integer, 600) then
      insert into public.api_key_events (api_key_id, user_id, kind, details)
      values (v_key.id, v_key.user_id, 'sustained_rate_limiting', jsonb_build_object('rejections_this_hour', v_used));
    end if;

    -- Rejections are logged so the dashboard can show them, but a flood is
    -- sampled (first 20 per hour, then every 50th) rather than written row by row.
    if v_used <= 20 or v_used % 50 = 0 then
      insert into public.api_request_logs
        (api_key_id, user_id, key_prefix, endpoint, status, error_code, response_ms, cache_status, ip_hash, country, user_agent)
      values
        (v_key.id, v_key.user_id, v_key.key_prefix, left(coalesce(p_log ->> 'endpoint', ''), 80), v_status, v_error,
         0, 'none', left(p_log ->> 'ip_hash', 64), left(p_log ->> 'country', 2), left(p_log ->> 'user_agent', 256));
    end if;

    return jsonb_build_object(
      'ok', false, 'error', v_error, 'status', v_status, 'retry_after', v_retry,
      'key_id', v_key.id, 'user_id', v_key.user_id);
  end if;

  update public.api_key_state
     set sec_window = v_sec, sec_count = v_sec_count + 1,
         min_window = v_min, min_count = v_min_count + 1
   where api_key_id = v_key.id;

  insert into public.api_inflight (request_id, api_key_id, started_at)
  values (p_request_id, v_key.id, v_now);

  -- Throttled so a busy key doesn't rewrite its row on every request.
  if v_key.last_used_at is null or v_key.last_used_at < v_now - interval '1 minute' then
    update public.api_keys set last_used_at = v_now where id = v_key.id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'key_id', v_key.id,
    'user_id', v_key.user_id,
    'key_prefix', v_key.key_prefix,
    'period_start', v_start,
    'period_end', v_end,
    'quota', p_quota,
    'used', v_used,
    'minute_limit', v_per_minute,
    'minute_remaining', greatest(0, v_per_minute - v_min_count - 1));
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. api_finish: release the concurrency slot, refund quota for failed
-- requests, write the log row, and run the (at most once a minute per key)
-- key-sharing / proxy anomaly check.
-- ---------------------------------------------------------------------------
create or replace function public.api_finish(
  p_request_id    uuid,
  p_key_id        uuid,
  p_user_id       uuid,
  p_period_start  timestamptz,
  p_success       boolean,
  p_log           jsonb,
  p_anomaly       jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now        timestamptz := clock_timestamp();
  v_window     integer := coalesce((p_anomaly ->> 'window_minutes')::integer, 10);
  v_max_ips    integer := coalesce((p_anomaly ->> 'distinct_ips')::integer, 20);
  v_max_ctry   integer := coalesce((p_anomaly ->> 'distinct_countries')::integer, 4);
  v_tighten    integer := coalesce((p_anomaly ->> 'tighten_minutes')::integer, 30);
  v_ips        integer;
  v_countries  integer;
  v_kind       text;
begin
  delete from public.api_inflight where request_id = p_request_id;

  if not p_success and p_period_start is not null then
    update public.api_usage_periods
       set used = greatest(used - 1, 0), updated_at = v_now
     where user_id = p_user_id and period_start = p_period_start;
  end if;

  insert into public.api_request_logs
    (api_key_id, user_id, key_prefix, endpoint, status, error_code, response_ms, cache_status, ip_hash, country, user_agent)
  values
    (p_key_id, p_user_id, left(p_log ->> 'key_prefix', 24), left(coalesce(p_log ->> 'endpoint', ''), 80),
     coalesce((p_log ->> 'status')::smallint, 0), left(p_log ->> 'error_code', 40),
     (p_log ->> 'response_ms')::integer, p_log ->> 'cache_status',
     left(p_log ->> 'ip_hash', 64), left(p_log ->> 'country', 2), left(p_log ->> 'user_agent', 256));

  update public.api_key_state
     set last_anomaly_check = v_now
   where api_key_id = p_key_id
     and (last_anomaly_check is null or last_anomaly_check < v_now - interval '1 minute');
  if not found then
    return;
  end if;

  select count(distinct ip_hash), count(distinct country)
    into v_ips, v_countries
    from public.api_request_logs
   where api_key_id = p_key_id
     and created_at > v_now - make_interval(mins => v_window);

  if v_ips > v_max_ips then
    v_kind := 'suspicious_ip_spread';
  elsif v_countries > v_max_ctry then
    v_kind := 'suspicious_country_spread';
  else
    return;
  end if;

  -- Never an automatic ban: tighten limits for a while and record the event
  -- (at most one event per key and kind per hour).
  update public.api_key_state
     set throttled_until = v_now + make_interval(mins => v_tighten)
   where api_key_id = p_key_id;

  if not exists (
    select 1 from public.api_key_events
     where api_key_id = p_key_id and kind = v_kind and created_at > v_now - interval '1 hour'
  ) then
    insert into public.api_key_events (api_key_id, user_id, kind, details)
    values (p_key_id, p_user_id, v_kind, jsonb_build_object(
      'window_minutes', v_window, 'distinct_ips', v_ips, 'distinct_countries', v_countries));
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. Key creation, with the active-key cap enforced atomically
-- ---------------------------------------------------------------------------
create or replace function public.api_create_key(
  p_user_id  uuid,
  p_name     text,
  p_prefix   text,
  p_hash     text,
  p_max_keys integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sub    record;
  v_active integer;
  v_row    public.api_keys%rowtype;
begin
  select status, current_period_end into v_sub
    from public.api_subscriptions where user_id = p_user_id
     for update;

  if not found or not public.api_is_entitled(v_sub.status, v_sub.current_period_end, now()) then
    return jsonb_build_object('ok', false, 'error', 'api_access_required');
  end if;

  select count(*) into v_active from public.api_keys where user_id = p_user_id and revoked_at is null;
  if v_active >= p_max_keys then
    return jsonb_build_object('ok', false, 'error', 'too_many_keys');
  end if;

  insert into public.api_keys (user_id, name, key_prefix, key_hash)
  values (p_user_id, p_name, p_prefix, p_hash)
  returning * into v_row;

  return jsonb_build_object('ok', true, 'id', v_row.id, 'name', v_row.name,
    'key_prefix', v_row.key_prefix, 'created_at', v_row.created_at);
end;
$$;

-- ---------------------------------------------------------------------------
-- 10. Retention: detailed logs are pruned; api_usage_periods is kept.
-- ---------------------------------------------------------------------------
create or replace function public.api_prune(p_log_retention_days integer default 90)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  delete from public.api_request_logs
   where created_at < now() - make_interval(days => greatest(p_log_retention_days, 1));
  get diagnostics v_deleted = row_count;

  delete from public.api_inflight where started_at < now() - interval '1 hour';
  delete from public.api_key_events where created_at < now() - interval '365 days';
  return v_deleted;
end;
$$;

revoke execute on function public.api_authorize(text, uuid, integer, integer, integer, integer, integer, jsonb) from public, anon, authenticated;
revoke execute on function public.api_finish(uuid, uuid, uuid, timestamptz, boolean, jsonb, jsonb) from public, anon, authenticated;
revoke execute on function public.api_create_key(uuid, text, text, text, integer) from public, anon, authenticated;
revoke execute on function public.api_prune(integer) from public, anon, authenticated;
grant execute on function public.api_authorize(text, uuid, integer, integer, integer, integer, integer, jsonb) to service_role;
grant execute on function public.api_finish(uuid, uuid, uuid, timestamptz, boolean, jsonb, jsonb) to service_role;
grant execute on function public.api_create_key(uuid, text, text, text, integer) to service_role;
grant execute on function public.api_prune(integer) to service_role;

-- Daily pruning with pg_cron when it's available (enable it under
-- Database → Extensions). Change 90 to adjust detailed-log retention.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'api-prune-logs';
    perform cron.schedule('api-prune-logs', '17 3 * * *', 'select public.api_prune(90)');
  end if;
exception when others then
  raise notice 'pg_cron not available; schedule public.api_prune(90) manually';
end
$$;

-- ---------------------------------------------------------------------------
-- 11. Internal monitoring views (service role / SQL editor only)
-- ---------------------------------------------------------------------------
create or replace view public.api_admin_hourly with (security_invoker = true) as
select date_trunc('hour', created_at)                                          as hour,
       count(*)                                                                as requests,
       count(*) filter (where status between 200 and 299)                      as successful,
       count(*) filter (where status = 429)                                    as rate_limited,
       count(*) filter (where status >= 500)                                   as server_errors,
       round(100.0 * count(*) filter (where status >= 400) / nullif(count(*), 0), 2) as error_rate_pct,
       round(avg(response_ms) filter (where status between 200 and 299))       as avg_response_ms,
       count(*) filter (where cache_status in ('hit', 'coalesced'))            as cache_hits,
       count(*) filter (where cache_status = 'miss')                           as db_queries,
       round(100.0 * count(*) filter (where cache_status in ('hit', 'coalesced'))
             / nullif(count(*) filter (where cache_status <> 'none'), 0), 2)   as cache_hit_rate_pct
  from public.api_request_logs
 group by 1;

create or replace view public.api_admin_top_users_30d with (security_invoker = true) as
select l.user_id, p.email,
       count(*)                                              as requests,
       count(*) filter (where l.status between 200 and 299)  as successful,
       count(*) filter (where l.status = 429)                as rate_limited
  from public.api_request_logs l
  left join public.profiles p on p.user_id = l.user_id
 where l.created_at > now() - interval '30 days'
 group by l.user_id, p.email;

create or replace view public.api_admin_top_endpoints_24h with (security_invoker = true) as
select endpoint, count(*) as requests,
       round(avg(response_ms) filter (where status between 200 and 299)) as avg_response_ms
  from public.api_request_logs
 where created_at > now() - interval '24 hours'
 group by endpoint;

revoke all on public.api_admin_hourly, public.api_admin_top_users_30d, public.api_admin_top_endpoints_24h
  from anon, authenticated;
