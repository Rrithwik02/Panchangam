import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { AUTH_LINK_ERRORS } from "@/lib/auth/validation";

export const metadata: Metadata = { title: "Forgot password — Panchangam", robots: { index: false } };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <ForgotPasswordForm initialError={error ? AUTH_LINK_ERRORS[error] : null} />;
}
