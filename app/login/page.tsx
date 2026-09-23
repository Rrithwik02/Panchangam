import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeNextPath } from "@/lib/auth/redirect";
import { AUTH_LINK_ERRORS } from "@/lib/auth/validation";

export const metadata: Metadata = { title: "Log in — Panchangam", robots: { index: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return <LoginForm next={safeNextPath(next)} initialError={error ? AUTH_LINK_ERRORS[error] : null} />;
}
