import { apiError } from "@/lib/api-access/errors";

// Anything under /api/v1 that isn't an explicitly supported endpoint. Answered
// without authentication or database work.
export const dynamic = "force-dynamic";

const unsupported = () => apiError(404, "unsupported_endpoint");

export const GET = unsupported;
export const POST = unsupported;
export const PUT = unsupported;
export const PATCH = unsupported;
export const DELETE = unsupported;
