"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  describeAuthError,
  PASSWORD_HINT,
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/auth/validation";
import { Field, FormMessage, SubmitButton } from "@/components/auth/AuthUI";

/** Sets a new password for the signed-in user (recovery session or account security). */
export function NewPasswordForm({ redirectTo, submitLabel }: { redirectTo?: string; submitLabel: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string | null; confirm?: string | null }>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next = {
      password: validatePassword(password),
      confirm: validatePasswordConfirmation(password, confirm),
    };
    setErrors(next);
    if (next.password || next.confirm) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Password changes are temporarily unavailable.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(describeAuthError(updateError));
        return;
      }
      setDone(true);
      setPassword("");
      setConfirm("");
      if (redirectTo) {
        router.replace(redirectTo);
        router.refresh();
      }
    } catch (err) {
      setError(describeAuthError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {error && <FormMessage tone="error">{error}</FormMessage>}
      {done && <FormMessage tone="success">Your password has been updated.</FormMessage>}
      <Field
        label="New password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        hint={PASSWORD_HINT}
      />
      <Field
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={errors.confirm}
      />
      <SubmitButton loading={loading}>{submitLabel}</SubmitButton>
    </form>
  );
}
