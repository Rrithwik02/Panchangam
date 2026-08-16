import "server-only";

import {
  fetchPanchangamByDate,
  fetchPanchangamByMonth,
  fetchPanchangamByRange,
} from "@/lib/repositories/panchangam-repository";
import {
  buildDayResponse,
  buildListResponse,
  createErrorResponse,
  mapCalendarDay,
  mapFestivalDay,
  parseStrictDate,
  REFERENCE_DAY,
} from "@/lib/api/panchangam";
import type { LocationParameters, PanchangamApiMeta } from "@/lib/types/panchangam";

export async function getPanchangamByDate(
  date: string,
  location: LocationParameters
) {
  const result = await fetchPanchangamByDate(date);
  return {
    day: result.day,
    meta: {
      location,
      calculation_source: "precomputed",
      data_source: result.source,
    } satisfies PanchangamApiMeta & { data_source: "supabase" | "reference" },
  };
}

export async function getPanchangamToday(location: LocationParameters) {
  return getPanchangamByDate(REFERENCE_DAY.date, location);
}

export async function getPanchangamYesterday(location: LocationParameters) {
  const yesterday = new Date(`${REFERENCE_DAY.date}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const date = yesterday.toISOString().slice(0, 10);
  return getPanchangamByDate(date, location);
}

export async function getPanchangamTomorrow(location: LocationParameters) {
  const tomorrow = new Date(`${REFERENCE_DAY.date}T00:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const date = tomorrow.toISOString().slice(0, 10);
  return getPanchangamByDate(date, location);
}

export async function getPanchangamDateResponse(
  date: string,
  location: LocationParameters
) {
  if (!parseStrictDate(date)) {
    return createErrorResponse("INVALID_DATE", "The supplied date is not valid.");
  }

  const result = await getPanchangamByDate(date, location);
  return Response.json({
    success: true,
    data: buildDayResponse(result.day, location).data,
    meta: {
      ...result.meta,
    },
  });
}

export async function getPanchangamRangeResponse(
  startDate: string,
  endDate: string,
  location: LocationParameters
) {
  const days = await fetchPanchangamByRange(startDate, endDate);
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
  const days = await fetchPanchangamByMonth(year, month);
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
  const days = await fetchPanchangamByMonth(year, month);
  return Response.json(
    buildListResponse(days.map((item) => mapCalendarDay(item.day)), location, { year, month })
  );
}

export async function getCalendarYearResponse(year: number, location: LocationParameters) {
  if (REFERENCE_DAY.date.startsWith(String(year))) {
    return Response.json(
      buildListResponse([mapCalendarDay(REFERENCE_DAY)], location, { year })
    );
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
  const days = await fetchPanchangamByMonth(year, month);
  return Response.json(
    buildListResponse(days.map((item) => mapFestivalDay(item.day)), location, { year, month })
  );
}

export async function getFestivalYearResponse(year: number, location: LocationParameters) {
  if (REFERENCE_DAY.date.startsWith(String(year))) {
    return Response.json(
      buildListResponse([mapFestivalDay(REFERENCE_DAY)], location, { year })
    );
  }

  return createErrorResponse(
    "DATA_NOT_FOUND",
    "Festival data is not available for the requested year.",
    404
  );
}
