import type { Metadata } from "next";
import { AuthShell, FormMessage, TextLink } from "@/components/auth/AuthUI";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import { getViewer } from "@/lib/billing/entitlement";

export const metadata: Metadata = { title: "Choose a new password — Panchangam", robots: { index: false } };
export const dynamic = "force-dynamic";

// Reached from the emailed reset link via /auth/callback, which has already
// exchanged the one-time code for a short recovery session.
export default async function ResetPasswordPage() {
  const viewer = await getViewer();

  if (!viewer) {
    return (
      <AuthShell title="Link expired" footer={<TextLink href="/login">Back to log in</TextLink>}>
        <FormMessage tone="error">
          This password reset link is invalid or has expired. Please request a new one.
        </FormMessage>
        <p className="text-center text-sm">
          <TextLink href="/forgot-password">Request a new link</TextLink>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle={viewer.email ?? undefined}>
      <NewPasswordForm redirectTo="/account?password=updated" submitLabel="Update password" />
    </AuthShell>
  );
}
