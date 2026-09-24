import { apiRoute } from "@/lib/api-access";
import { panchangamTomorrow } from "@/lib/api-access/endpoints";

// Paid API: API key + active API subscription, rate/burst/concurrency limits
// and monthly quota are enforced in lib/api-access before any data is read.
export const dynamic = "force-dynamic";
export const maxDuration = 10;

export const GET = apiRoute(panchangamTomorrow);
