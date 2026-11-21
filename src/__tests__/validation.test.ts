import { describe, it, expect } from "vitest";
import {
  CreateComplaintSchema,
  AdminAuthSchema,
  UpdateComplaintAdminSchema,
} from "@/lib/validation";

describe("Validation Schemas", () => {
  it("validates a properly formatted complaint payload", () => {
    const validData = {
      title: "Broken streetlight on 1st Main Road",
      description: "The streetlight has been flickering and completely off for three nights.",
      location: "1st Main Road, Gandhi Nagar",
      userCategory: "Streetlights & Electrical",
    };

    const res = CreateComplaintSchema.safeParse(validData);
    expect(res.success).toBe(true);
  });

  it("fails if title is too short (< 5 chars)", () => {
    const invalidData = {
      title: "Pipe",
      description: "Water is leaking heavily on the main road.",
      location: "Anna Salai",
    };

    const res = CreateComplaintSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it("fails if description is too short (< 10 chars)", () => {
    const invalidData = {
      title: "Huge pothole on road",
      description: "Broken",
      location: "Anna Salai",
    };

    const res = CreateComplaintSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it("fails if location is too short (< 3 chars)", () => {
    const invalidData = {
      title: "Huge pothole on road",
      description: "Water is leaking heavily on the main road.",
      location: "A",
    };

    const res = CreateComplaintSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it("rejects unauthorized file MIME types", () => {
    const invalidImage = {
      title: "Huge pothole on road",
      description: "Water is leaking heavily on the road.",
      location: "Anna Salai",
      imageBase64: "dGVzdA==",
      imageMimeType: "application/pdf" as any,
    };

    const res = CreateComplaintSchema.safeParse(invalidImage);
    expect(res.success).toBe(false);
  });

  it("validates admin auth schema", () => {
    expect(AdminAuthSchema.safeParse({ secret: "CivicResolve2026!" }).success).toBe(true);
    expect(AdminAuthSchema.safeParse({ secret: "" }).success).toBe(false);
  });

  it("validates admin complaint update schema", () => {
    expect(
      UpdateComplaintAdminSchema.safeParse({
        status: "In Progress",
        priority: "Critical",
        department: "Public Works Department",
        adminNotes: "Team dispatched",
      }).success
    ).toBe(true);

    expect(
      UpdateComplaintAdminSchema.safeParse({
        status: "NonExistentStatus" as any,
      }).success
    ).toBe(false);
  });
});
