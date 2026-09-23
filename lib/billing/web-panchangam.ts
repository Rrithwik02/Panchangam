import "server-only";

import { normalizeLocation } from "@/lib/api/panchangam";
import { getPanchangamDateResponse } from "@/lib/services/panchangam-service";
import { getEntitlement } from "@/lib/billing/entitlement";
import { resolveDateAccess } from "@/lib/billing/panchangam-access";
import { PLANS, SUPPORTED_RANGE } from "@/lib/billing/plans";
import { jsonError, PRIVATE_NO_STORE } from "@/lib/auth/request";

/**
 * Serves one date's Panchangam to the website, deciding full / preview /
 * locked from the viewer's subscription in the database. Reuses the existing
 * Panchangam service and data unchanged.
 */
export async function getWebPanchangamForDate(url: URL, date: string) {
  const locationResult = normalizeLocation({
    latitude: url.searchParams.get("latitude"),
    longitude: url.searchParams.get("longitude"),
    timezone: url.searchParams.get("timezone"),
  });
  if (locationResult.error) return locationResult.error;

  const location = locationResult.location;
  const { isPro, viewer } = await getEntitlement();
  const access = resolveDateAccess(date, location.timezone, isPro);

  if (access === "out_of_range") {
    return jsonError(
      "DATE_OUT_OF_RANGE",
      `Panchangam is available from ${SUPPORTED_RANGE.start} to ${SUPPORTED_RANGE.end}.`,
      404
    );
  }

  if (access === "pro_required") {
    return Response.json(
      {
        success: false,
        error: {
          code: "PRO_REQUIRED",
          message: `Exploring the full 50-year Panchangam is part of Pro (₹${PLANS.pro.priceInr}/month).`,
        },
        meta: { signed_in: Boolean(viewer) },
      },
      { status: 403, headers: PRIVATE_NO_STORE }
    );
  }

  const response = await getPanchangamDateResponse(date, location, {
    preview: access === "preview",
  });
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", PRIVATE_NO_STORE["Cache-Control"]);
  return new Response(response.body, { status: response.status, headers });
}
