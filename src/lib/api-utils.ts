import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Standard HTTP Cache-Control header for public municipal data
 */
export const CACHE_CONTROL_PUBLIC = "public, s-maxage=15, stale-while-revalidate=30";

export const CACHE_HEADERS = {
  "Cache-Control": CACHE_CONTROL_PUBLIC,
};

/**
 * Formats a successful JSON response
 */
export function jsonSuccess<T>(data: T, status = 200, headers: Record<string, string> = {}): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  );
}

/**
 * Formats a standardized JSON error response
 */
export function jsonError(
  message: string,
  status = 400,
  details: unknown = null
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

/**
 * Flattens Zod validation issues into structured key-message pairs
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const flattened = error.flatten();
  return flattened.fieldErrors as Record<string, string[]>;
}
