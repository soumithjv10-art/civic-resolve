import { describe, it, expect } from "vitest";
import {
  CreateComplaintSchema,
  AdminAuthSchema,
  UpdateComplaintAdminSchema,
} from "@/lib/validation";
import { ComplaintStatus } from "@/lib/types";

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

  it("fails if title is too short (< 3 chars)", () => {
    const invalidData = {
      title: "P",
      description: "Water is leaking heavily on the main road.",
      location: "Anna Salai",
    };

    const res = CreateComplaintSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it("allows complaints without manual description since AI auto-generates it", () => {
    const validData = {
      title: "Huge road crater near bus stop",
      location: "Anna Salai",
    };

    const res = CreateComplaintSchema.safeParse(validData);
    expect(res.success).toBe(true);
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
      imageMimeType: "application/pdf" as unknown as "image/jpeg",
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
        status: "NonExistentStatus" as unknown as ComplaintStatus,
      }).success
    ).toBe(false);
  });
});
