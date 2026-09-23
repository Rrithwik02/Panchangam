// Only allow same-site relative paths as post-auth destinations, so a crafted
// ?next= value can't bounce users to another origin.
export function safeNextPath(value: string | null | undefined, fallback = "/account") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}

export const PROTECTED_PREFIXES = ["/account"];
export const AUTH_ONLY_FOR_GUESTS = ["/login", "/signup", "/forgot-password"];

export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isGuestOnlyPath(pathname: string) {
  return AUTH_ONLY_FOR_GUESTS.includes(pathname);
}
