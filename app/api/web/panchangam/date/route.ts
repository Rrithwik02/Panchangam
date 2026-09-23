import { parseStrictDate } from "@/lib/api/panchangam";
import { getWebPanchangamForDate } from "@/lib/billing/web-panchangam";
import { jsonError } from "@/lib/auth/request";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Website date explorer. Access is decided server-side from the subscription.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date || !parseStrictDate(date)) {
    return jsonError("INVALID_DATE", "Please choose a valid date.", 400);
  }

  return getWebPanchangamForDate(url, date);
}
