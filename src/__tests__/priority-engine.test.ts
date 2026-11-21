import { describe, it, expect } from "vitest";
import { classifyDeterministically } from "@/lib/priority-engine";

describe("Deterministic Triage Engine", () => {
  it("classifies live electrical wires as Critical priority", () => {
    const res = classifyDeterministically(
      "Live wire hanging near bus stop",
      "An electric shock risk exists as exposed live wire is dangling 3 feet from ground."
    );

    expect(res.priority).toBe("Critical");
    expect(res.category).toBe("Streetlights & Electrical");
    expect(res.department).toBe("Municipal Electrical & Streetlighting Board");
  });

  it("classifies open manholes as Critical priority under Drainage", () => {
    const res = classifyDeterministically(
      "Open manhole on pedestrian path",
      "Missing manhole cover on main sidewalk, deep drop risk."
    );

    expect(res.priority).toBe("Critical");
    expect(res.category).toBe("Drainage & Sewage");
  });

  it("classifies deep highway potholes as High priority", () => {
    const res = classifyDeterministically(
      "Deep pothole on highway",
      "Vehicles are skidding due to deep crater after the toll booth."
    );

    expect(res.priority).toBe("High");
    expect(res.category).toBe("Roads & Potholes");
  });

  it("classifies overflowing garbage bins as Medium priority", () => {
    const res = classifyDeterministically(
      "Overflowing garbage bins at market corner",
      "Solid waste has piled up and trash is spilling onto the road."
    );

    expect(res.priority).toBe("Medium");
    expect(res.category).toBe("Garbage & Sanitation");
  });

  it("classifies park bench issues as Low priority", () => {
    const res = classifyDeterministically(
      "Broken bench in neighborhood park",
      "A wooden bench has a cracked plank in the children's playground."
    );

    expect(res.priority).toBe("Low");
    expect(res.category).toBe("Public Safety & Parks");
  });
});
