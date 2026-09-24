import "server-only";

import { fetchPanchangamByDate } from "@/lib/repositories/panchangam-repository";
import {
  buildDayResponse,
  buildPreviewDayResponse,
  createErrorResponse,
  getTodayDateForTimezone,
  getYesterdayDateForTimezone,
  parseStrictDate,
} from "@/lib/api/panchangam";
import type { LocationParameters, PanchangamApiMeta } from "@/lib/types/panchangam";

type RepositoryErrorResult = {
  error?: {
    code: string;
    message: string;
    status: number;
  };
};

function buildRepositoryErrorResponse(result: RepositoryErrorResult | null | undefined) {
  if (!result?.error) {
    return null;
  }

  return createErrorResponse(result.error.code, result.error.message, result.error.status);
}

function buildResponseMeta(
  location: LocationParameters,
  dataSource: "supabase" | "reference",
  access: "full" | "preview" = "full"
): PanchangamApiMeta {
  return {
    location,
    calculation_source: "precomputed",
    data_source: dataSource,
    access,
    ...(access === "preview"
      ? { preview_fields: ["Date", "Vara", "Paksha", "Tithi", "Nakshatra"] }
      : {}),
  };
}

export async function getPanchangamByDate(date: string) {
  return fetchPanchangamByDate(date);
}

export async function getPanchangamDateResponse(
  date: string,
  location: LocationParameters,
  options?: { preview?: boolean }
) {
  if (!parseStrictDate(date)) {
    return createErrorResponse("INVALID_DATE", "The supplied date is not valid.");
  }

  const result = await getPanchangamByDate(date);
  const errorResponse = buildRepositoryErrorResponse(result);
  if (errorResponse) {
    return errorResponse;
  }

  if (!result.day) {
    return createErrorResponse(
      "DATA_NOT_FOUND",
      "Panchangam data is not available for the requested date.",
      404
    );
  }

  const access = options?.preview ? "preview" : "full";
  const payload = options?.preview
    ? buildPreviewDayResponse(result.day, location).data
    : buildDayResponse(result.day, location).data;

  return Response.json({
    success: true,
    data: payload,
    meta: buildResponseMeta(location, result.source ?? "reference", access),
  });
}

export async function getPanchangamToday(location: LocationParameters) {
  const date = getTodayDateForTimezone(location.timezone);
  if (!date) {
    return createErrorResponse("INVALID_TIMEZONE", "The supplied timezone is not valid.");
  }

  return getPanchangamDateResponse(date, location);
}

export async function getPanchangamYesterday(location: LocationParameters) {
  const date = getYesterdayDateForTimezone(location.timezone);
  if (!date) {
    return createErrorResponse("INVALID_TIMEZONE", "The supplied timezone is not valid.");
  }

  return getPanchangamDateResponse(date, location);
}
