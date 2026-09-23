import "server-only";

// Rejects state-changing requests coming from another origin. Supabase auth
// cookies are SameSite=Lax already; this is defence in depth.
export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin fetches from some browsers omit it
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export const PRIVATE_NO_STORE = { "Cache-Control": "private, no-store" };

export function jsonError(code: string, message: string, status: number) {
  return Response.json(
    { success: false, error: { code, message } },
    { status, headers: PRIVATE_NO_STORE }
  );
}
