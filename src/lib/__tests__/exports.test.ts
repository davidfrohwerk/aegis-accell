import { describe, expect, it } from "vitest";
import { exportSessionToJson, exportSessionToMarkdown } from "../exports";
import { createClaim, createProvenance, createResearchSession } from "../models";

describe("session exports", () => {
  const session = createResearchSession({
    id: "session_export",
    title: "Pricing power review",
    researchQuestion: "Can the company raise prices without churn?",
    summary: "Early evidence is mixed.",
    tags: ["pricing", "churn"],
    createdAt: "2026-05-28T10:00:00.000Z",
    updatedAt: "2026-05-28T10:10:00.000Z",
    claims: [
      createClaim({
        id: "claim_pricing",
        statement: "Enterprise customers tolerate annual price increases.",
        confidence: "high",
        evidenceStrength: "mixed",
        provenanceIds: ["source_call"]
      })
    ],
    provenance: [
      createProvenance({
        id: "source_call",
        sourceTitle: "Customer call notes",
        sourceType: "interview",
        excerpt: "Three customers accepted price increases."
      })
    ]
  });

  it("exports stable pretty JSON", () => {
    const exported = exportSessionToJson(session);
    const parsed = JSON.parse(exported);

    expect(exported).toContain('\n  "title": "Pricing power review"');
    expect(exported.endsWith("\n")).toBe(true);
    expect(parsed.id).toBe("session_export");
    expect(parsed.claims[0].id).toBe("claim_pricing");
  });

  it("exports markdown with session sections and linked references", () => {
    const exported = exportSessionToMarkdown(session);

    expect(exported).toContain("# Pricing power review");
    expect(exported).toContain("## Research Question");
    expect(exported).toContain("## Claims");
    expect(exported).toContain("Enterprise customers tolerate annual price increases.");
    expect(exported).toContain("## Provenance");
    expect(exported).toContain("> Three customers accepted price increases.");
    expect(exported).toContain("## Red-Team Checkpoints");
    expect(exported).toContain("_None yet._");
  });
});
