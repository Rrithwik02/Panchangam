"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { describeAuthError, validateEmail } from "@/lib/auth/validation";
import { AuthShell, Field, FormMessage, GoogleButton, OrDivider, SubmitButton, TextLink } from "@/components/auth/AuthUI";

export function LoginForm({ next, initialError }: { next: string; initialError?: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = {
      email: validateEmail(email),
      password: password ? null : "Please enter your password.",
    };
    setFieldErrors(errors);
    if (errors.email || errors.password) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Sign-in is temporarily unavailable. Please try again later.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(describeAuthError(signInError));
        return;
      }
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(describeAuthError(err as Error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your Panchangam account"
      footer={
        <>
          <p>Don&apos;t have an account?</p>
          <TextLink href={`/signup${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}>
            Create account
          </TextLink>
        </>
      }
    >
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />
        <SubmitButton loading={loading}>Log in</SubmitButton>
      </form>
      <OrDivider />
      <GoogleButton next={next} />
      <p className="text-center text-sm">
        <TextLink href="/forgot-password">Forgot password?</TextLink>
      </p>
    </AuthShell>
  );
}
