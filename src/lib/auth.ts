import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_COOKIE_NAME = "civic_admin_session";

function getExpectedToken(): string {
  const secret = process.env.ADMIN_SECRET || "CivicResolve2026!";
  return crypto.createHash("sha256").update(secret + "_salt_civic").digest("hex");
}

export function verifyAdminSecret(secret: string): boolean {
  const currentSecret = process.env.ADMIN_SECRET || "CivicResolve2026!";
  return secret === currentSecret;
}

export function generateAdminSessionToken(): string {
  return getExpectedToken();
}

export async function isCurrentAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return false;
  }
  return sessionCookie.value === getExpectedToken();
}

export const ADMIN_COOKIE_OPTIONS = {
  name: ADMIN_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 24 hours
};
