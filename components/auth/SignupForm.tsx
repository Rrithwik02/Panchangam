"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  describeAuthError,
  PASSWORD_HINT,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/auth/validation";
import { AuthShell, Field, FormMessage, GoogleButton, OrDivider, SubmitButton, TextLink } from "@/components/auth/AuthUI";

type Errors = Partial<Record<"name" | "email" | "password" | "confirm", string | null>>;

export function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [fieldErrors, setFieldErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors: Errors = {
      name: form.name.trim() ? null : "Please enter your name.",
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: validatePasswordConfirmation(form.password, form.confirm),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Sign-up is temporarily unavailable. Please try again later.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { name: form.name.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (signUpError) {
        setError(describeAuthError(signUpError));
        return;
      }

      // With email confirmation on, Supabase returns a user with no
      // identities (and sends nothing) when the email is already registered.
      if (data.user && data.user.identities?.length === 0) {
        setError("An account with this email already exists. Try logging in instead.");
        return;
      }

      if (data.session) {
        router.replace(next);
        router.refresh();
        return;
      }

      setSentTo(form.email.trim());
    } catch (err) {
      setError(describeAuthError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <AuthShell title="Check your email" footer={<TextLink href="/login">Back to log in</TextLink>}>
        <FormMessage tone="success">
          We sent a confirmation link to <strong>{sentTo}</strong>. Open it to activate your account —
          you&apos;ll be signed in automatically.
        </FormMessage>
        <p className="text-xs text-muted">Didn&apos;t get it? Check your spam folder, or try signing up again in a minute.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever. Upgrade to Pro any time."
      footer={
        <>
          <p>Already have an account?</p>
          <TextLink href="/login">Log in</TextLink>
        </>
      }
    >
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Name" autoComplete="name" value={form.name} onChange={update("name")} error={fieldErrors.name} />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update("email")}
          error={fieldErrors.email}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update("password")}
          error={fieldErrors.password}
          hint={PASSWORD_HINT}
        />
        <Field
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={update("confirm")}
          error={fieldErrors.confirm}
        />
        <SubmitButton loading={loading}>Create account</SubmitButton>
      </form>
      <OrDivider />
      <GoogleButton next={next} />
    </AuthShell>
  );
}
