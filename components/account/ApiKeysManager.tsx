"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { accountButton, StatusPill } from "@/components/account/AccountUI";
import { FormMessage } from "@/components/auth/AuthUI";

export interface ApiKeyView {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export function ApiKeysManager({
  keys,
  canCreate,
  maxActiveKeys,
}: {
  keys: ApiKeyView[];
  canCreate: boolean;
  maxActiveKeys: number;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [created, setCreated] = useState<{ name: string; secret: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeCount = keys.filter((k) => !k.revoked_at).length;

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending("create");
    setError(null);
    try {
      const res = await fetch("/api/account/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) {
        setError(body?.error?.message ?? "We couldn't create the key. Please try again.");
        return;
      }
      setCreated({ name: body.data.name, secret: body.data.secret });
      setCopied(false);
      setName("");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPending(null);
    }
  };

  const revoke = async (id: string) => {
    setPending(id);
    setError(null);
    try {
      const res = await fetch(`/api/account/api-keys/${id}/revoke`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error?.message ?? "We couldn't revoke the key. Please try again.");
        return;
      }
      setConfirmRevoke(null);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPending(null);
    }
  };

  const copy = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.secret);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && <FormMessage tone="error">{error}</FormMessage>}

      {created && (
        <div className="space-y-3 rounded-xl border border-accent/40 bg-accent/5 p-4">
          <p className="text-sm font-semibold">Your new key “{created.name}”</p>
          <p className="text-sm text-muted">
            Copy it now and store it somewhere safe, like a secrets manager. For your security it
            won&apos;t be shown again — if you lose it, revoke it and create a new one.
          </p>
          <div className="flex items-stretch gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs">
              {created.secret}
            </code>
            <button type="button" onClick={copy} className={accountButton.secondary} aria-label="Copy API key">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button type="button" onClick={() => setCreated(null)} className="text-sm font-medium text-accent underline">
            I&apos;ve saved it
          </button>
        </div>
      )}

      {keys.length === 0 ? (
        <p className="text-sm text-muted">No API keys yet.</p>
      ) : (
        <ul className="divide-y divide-border/70 rounded-xl border border-border/70">
          {keys.map((key) => (
            <li key={key.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{key.name}</span>
                  {key.revoked_at ? (
                    <StatusPill tone="warn">Revoked</StatusPill>
                  ) : (
                    <StatusPill tone="good">Active</StatusPill>
                  )}
                </div>
                <p className="font-mono text-xs text-muted">{key.key_prefix}…</p>
                <p className="text-xs text-muted">
                  Created {formatDateTime(key.created_at)} ·{" "}
                  {key.last_used_at ? `last used ${formatDateTime(key.last_used_at)}` : "never used"}
                  {key.revoked_at && ` · revoked ${formatDateTime(key.revoked_at)}`}
                </p>
              </div>
              {!key.revoked_at &&
                (confirmRevoke === key.id ? (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => revoke(key.id)}
                      disabled={pending !== null}
                      className={accountButton.primary}
                    >
                      {pending === key.id ? "Revoking…" : "Revoke now"}
                    </button>
                    <button type="button" onClick={() => setConfirmRevoke(null)} className={accountButton.secondary}>
                      Keep
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmRevoke(key.id)}
                    className={`${accountButton.secondary} shrink-0`}
                  >
                    Revoke
                  </button>
                ))}
            </li>
          ))}
        </ul>
      )}

      {canCreate && activeCount < maxActiveKeys && (
        <form onSubmit={create} className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="api-key-name" className="sr-only">
            Key name
          </label>
          <input
            id="api-key-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            required
            placeholder="Key name, e.g. production-server"
            className="min-h-[40px] flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none focus:border-accent"
          />
          <button type="submit" disabled={pending !== null || !name.trim()} className={accountButton.primary}>
            {pending === "create" ? "Creating…" : "Create key"}
          </button>
        </form>
      )}
      {canCreate && activeCount >= maxActiveKeys && (
        <p className="text-sm text-muted">
          You have the maximum of {maxActiveKeys} active keys. Revoke one to create another.
        </p>
      )}
    </div>
  );
}
