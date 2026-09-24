// In-process Postgres (PGlite) with just enough of Supabase's environment —
// the auth schema, auth.uid() and the anon/authenticated/service_role roles —
// to run the real migrations and exercise the SQL functions and RLS.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "supabase", "migrations");

const SUPABASE_STUB = `
  create schema if not exists auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  do $$ begin
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  exception when duplicate_object then null; end $$;
  grant usage on schema public, auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

  -- Shape of the existing Panchangam table (only the key matters here).
  create table public.daily_panchangam (id bigint, date text primary key, vara text, tithi1_name text);
  insert into public.daily_panchangam (id, date, vara, tithi1_name)
    values (1, '2026-09-23', 'Wednesday', 'Saptami'), (2, '2026-09-24', 'Thursday', 'Ashtami');
`;

export async function createTestDb() {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);
  for (const file of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(path.join(MIGRATIONS_DIR, file), "utf8"));
  }
  await db.exec("grant all on all tables in schema public to service_role;");
  return db;
}

export async function createUser(db, id, email) {
  await db.query("insert into auth.users (id, email) values ($1, $2)", [id, email]);
}

/** Runs `fn` as a PostgREST-style role (optionally as a signed-in user). */
export async function asRole(db, role, userId, fn) {
  return db.transaction(async (tx) => {
    await tx.query(`set local role ${role}`);
    if (userId) await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [userId]);
    return fn(tx);
  });
}
