import { todaysPanchangam } from "@/lib/mock-panchangam";
import {
  formatLocationLabel,
  isValidLatitude,
  isValidLongitude,
  isValidTimezone,
  parseStrictDate,
} from "@/lib/location";
import type {
  PanchangamApiErrorResponse,
  PanchangamApiSuccessResponse,
} from "@/lib/types/panchangam";

function jsonError(
  code: string,
  message: string,
  status = 400
): Response {
  const body: PanchangamApiErrorResponse = {
    success: false,
    error: { code, message },
  };

  return Response.json(body, { status });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const latitudeParam = url.searchParams.get("latitude");
  const longitudeParam = url.searchParams.get("longitude");
  const timezone = url.searchParams.get("timezone") || "";

  if (!date) {
    return jsonError("INVALID_DATE", "The date query parameter is required.");
  }

  if (!parseStrictDate(date)) {
    return jsonError("INVALID_DATE", "The supplied date is not valid.");
  }

  if (date !== todaysPanchangam.date) {
    return jsonError(
      "DATA_NOT_FOUND",
      "Panchangam data is not available for the requested date.",
      404
    );
  }

  if (!timezone) {
    return jsonError("INVALID_TIMEZONE", "The timezone query parameter is required.");
  }

  if (!isValidTimezone(timezone)) {
    return jsonError("INVALID_TIMEZONE", "The supplied timezone is not valid.");
  }

  let latitude: number | null = null;
  let longitude: number | null = null;

  if (latitudeParam !== null || longitudeParam !== null) {
    if (latitudeParam === null || longitudeParam === null) {
      return jsonError(
        "INVALID_LOCATION",
        "Latitude and longitude must either both be provided or both be omitted."
      );
    }

    latitude = Number(latitudeParam);
    longitude = Number(longitudeParam);

    if (!isValidLatitude(latitude)) {
      return jsonError("INVALID_LATITUDE", "Latitude must be between -90 and 90.");
    }

    if (!isValidLongitude(longitude)) {
      return jsonError("INVALID_LONGITUDE", "Longitude must be between -180 and 180.");
    }
  }

  const location = {
    latitude,
    longitude,
    timezone,
  };

  const response: PanchangamApiSuccessResponse = {
    success: true,
    data: {
      ...todaysPanchangam,
      location: formatLocationLabel(location),
    },
    meta: {
      location,
      calculation_source: "precomputed",
    },
  };

  return Response.json(response);
}
