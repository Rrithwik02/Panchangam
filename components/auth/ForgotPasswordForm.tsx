"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { describeAuthError, validateEmail } from "@/lib/auth/validation";
import { AuthShell, Field, FormMessage, SubmitButton, TextLink } from "@/components/auth/AuthUI";

export function ForgotPasswordForm({ initialError }: { initialError?: string | null }) {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const emailError = validateEmail(email);
    setFieldError(emailError);
    if (emailError) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Password reset is temporarily unavailable. Please try again later.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      // Only surface errors that don't reveal whether the account exists.
      if (resetError && (resetError.status === 429 || resetError.message?.toLowerCase().includes("fetch"))) {
        setError(describeAuthError(resetError));
        return;
      }
      setSent(true);
    } catch (err) {
      setError(describeAuthError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure link to choose a new password."
      footer={<TextLink href="/login">Back to log in</TextLink>}
    >
      {sent ? (
        <FormMessage tone="success">
          If an account exists for <strong>{email.trim()}</strong>, a password reset link is on its way.
          The link works once and expires after a short time.
        </FormMessage>
      ) : (
        <>
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldError}
            />
            <SubmitButton loading={loading}>Send reset link</SubmitButton>
          </form>
        </>
      )}
    </AuthShell>
  );
}
