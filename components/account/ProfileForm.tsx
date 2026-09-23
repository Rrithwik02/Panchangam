"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field, FormMessage, SubmitButton } from "@/components/auth/AuthUI";

export function ProfileForm({ userId, initialName, email }: { userId: string; initialName: string; email: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setFieldError("Please enter your name.");
    if (trimmed.length > 120) return setFieldError("Name must be 120 characters or fewer.");
    setFieldError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return setMessage({ tone: "error", text: "Profile updates are temporarily unavailable." });

    setLoading(true);
    setMessage(null);
    try {
      // RLS + column grants only allow a user to change their own name.
      const [{ error }] = await Promise.all([
        supabase.from("profiles").update({ name: trimmed }).eq("user_id", userId),
        supabase.auth.updateUser({ data: { name: trimmed } }),
      ]);
      if (error) {
        setMessage({ tone: "error", text: "We couldn't save your profile. Please try again." });
        return;
      }
      setMessage({ tone: "success", text: "Profile saved." });
      router.refresh();
    } catch {
      setMessage({ tone: "error", text: "Network error — please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-sm space-y-4">
      {message && <FormMessage tone={message.tone}>{message.text}</FormMessage>}
      <Field label="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={fieldError} />
      <Field label="Email" type="email" value={email} readOnly disabled hint="Your sign-in email can't be changed here." />
      <SubmitButton loading={loading}>Save changes</SubmitButton>
    </form>
  );
}
