import { describe, it, expect } from "vitest";
import { verifyAdminSecret, generateAdminSessionToken } from "@/lib/auth";

describe("Admin Authentication", () => {
  it("verifies the default admin secret key", () => {
    expect(verifyAdminSecret("CivicResolve2026!")).toBe(true);
    expect(verifyAdminSecret("WrongPassword")).toBe(false);
  });

  it("generates deterministic admin session token based on secret hash", () => {
    const token1 = generateAdminSessionToken();
    const token2 = generateAdminSessionToken();
    expect(token1).toBe(token2);
    expect(token1.length).toBe(64); // SHA-256 hex string
  });
});
