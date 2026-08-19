import "server-only";

import {
  fetchPanchangamByDate,
  fetchPanchangamByMonth,
  fetchPanchangamByRange,
} from "@/lib/repositories/panchangam-repository";
import {
  buildDayResponse,
  buildListResponse,
  buildPreviewDayResponse,
  createErrorResponse,
  getTodayDateForTimezone,
  getTomorrowDateForTimezone,
  getYesterdayDateForTimezone,
  mapCalendarDay,
  mapFestivalDay,
  parseStrictDate,
  REFERENCE_DAY,
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

export async function getPanchangamTomorrow(location: LocationParameters) {
  const date = getTomorrowDateForTimezone(location.timezone);
  if (!date) {
    return createErrorResponse("INVALID_TIMEZONE", "The supplied timezone is not valid.");
  }

  return getPanchangamDateResponse(date, location, { preview: true });
}

export async function getPanchangamRelativeDateResponse(
  mode: "today" | "yesterday" | "tomorrow",
  location: LocationParameters
) {
  if (mode === "today") {
    return getPanchangamToday(location);
  }

  if (mode === "yesterday") {
    return getPanchangamYesterday(location);
  }

  return getPanchangamTomorrow(location);
}

export async function getPanchangamRangeResponse(
  startDate: string,
  endDate: string,
  location: LocationParameters
) {
  const result = await fetchPanchangamByRange(startDate, endDate);
  const errorResponse = buildRepositoryErrorResponse(result);
  if (errorResponse) {
    return errorResponse;
  }

  const days = result.items ?? [];
  if (days.length === 0) {
    return createErrorResponse(
      "DATA_NOT_FOUND",
      "Panchangam data is not available for the requested date range.",
      404
    );
  }

  return Response.json(
    buildListResponse(
      days.map((item) => buildDayResponse(item.day, location).data),
      location,
      {
        start_date: startDate,
        end_date: endDate,
      }
    )
  );
}

export async function getPanchangamMonthResponse(
  year: number,
  month: number,
  location: LocationParameters
) {
  const result = await fetchPanchangamByMonth(year, month);
  const errorResponse = buildRepositoryErrorResponse(result);
  if (errorResponse) {
    return errorResponse;
  }

  const days = result.items ?? [];
  if (days.length === 0) {
    return createErrorResponse(
      "DATA_NOT_FOUND",
      "Panchangam data is not available for the requested month.",
      404
    );
  }

  return Response.json(
    buildListResponse(
      days.map((item) => buildDayResponse(item.day, location).data),
      location,
      { year, month }
    )
  );
}

export async function getCalendarDateResponse(location: LocationParameters) {
  return Response.json(buildListResponse([mapCalendarDay(REFERENCE_DAY)], location));
}

export async function getCalendarMonthResponse(
  year: number,
  month: number,
  location: LocationParameters
) {
  const result = await fetchPanchangamByMonth(year, month);
  const errorResponse = buildRepositoryErrorResponse(result);
  if (errorResponse) {
    return errorResponse;
  }

  const days = result.items ?? [];
  return Response.json(
    buildListResponse(days.map((item) => mapCalendarDay(item.day)), location, { year, month })
  );
}

export async function getCalendarYearResponse(year: number, location: LocationParameters) {
  if (REFERENCE_DAY.date.startsWith(String(year))) {
    return Response.json(buildListResponse([mapCalendarDay(REFERENCE_DAY)], location, { year }));
  }

  return createErrorResponse(
    "DATA_NOT_FOUND",
    "Calendar data is not available for the requested year.",
    404
  );
}

export async function getFestivalDateResponse(location: LocationParameters) {
  return Response.json(buildListResponse([mapFestivalDay(REFERENCE_DAY)], location));
}

export async function getFestivalMonthResponse(
  year: number,
  month: number,
  location: LocationParameters
) {
  const result = await fetchPanchangamByMonth(year, month);
  const errorResponse = buildRepositoryErrorResponse(result);
  if (errorResponse) {
    return errorResponse;
  }

  const days = result.items ?? [];
  return Response.json(
    buildListResponse(days.map((item) => mapFestivalDay(item.day)), location, { year, month })
  );
}

export async function getFestivalYearResponse(year: number, location: LocationParameters) {
  if (REFERENCE_DAY.date.startsWith(String(year))) {
    return Response.json(buildListResponse([mapFestivalDay(REFERENCE_DAY)], location, { year }));
  }

  return createErrorResponse(
    "DATA_NOT_FOUND",
    "Festival data is not available for the requested year.",
    404
  );
}
