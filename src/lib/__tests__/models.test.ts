import { describe, expect, it } from "vitest";
import {
  createClaim,
  createResearchSession,
  normalizeResearchSession,
  parseTokenList,
  validateResearchSession
} from "../models";

describe("research session model", () => {
  it("creates a complete session with empty collections", () => {
    const session = createResearchSession({
      title: "Economic moat review",
      researchQuestion: "Does the company have durable pricing power?"
    });

    expect(session.id).toMatch(/^session_/);
    expect(session.title).toBe("Economic moat review");
    expect(session.status).toBe("draft");
    expect(session.claims).toEqual([]);
    expect(session.assumptions).toEqual([]);
    expect(session.provenance).toEqual([]);
    expect(session.contradictions).toEqual([]);
    expect(session.failureMarkers).toEqual([]);
    expect(session.redTeamCheckpoints).toEqual([]);
    expect(session.salvageNotes).toEqual([]);
  });

  it("normalizes invalid enum values and token arrays", () => {
    const session = normalizeResearchSession({
      id: "session_fixed",
      title: "  ",
      status: "not-a-status" as never,
      tags: [" durable ", "", "pricing"],
      claims: [
        createClaim({
          statement: "Margins are resilient.",
          confidence: "not-confidence" as never,
          provenanceIds: [" source_a ", ""]
        })
      ]
    });

    expect(session.title).toBe("Untitled research session");
    expect(session.status).toBe("draft");
    expect(session.tags).toEqual(["durable", "pricing"]);
    expect(session.claims[0].confidence).toBe("medium");
    expect(session.claims[0].provenanceIds).toEqual(["source_a"]);
  });

  it("reports validation issues without blocking draft creation", () => {
    const session = createResearchSession({
      title: "",
      researchQuestion: "",
      claims: [createClaim()]
    });

    expect(validateResearchSession(session)).toEqual(
      expect.arrayContaining([
        { path: "researchQuestion", message: "Research question is required." },
        { path: "claims.0.statement", message: "Claim statement is required." }
      ])
    );
  });

  it("parses comma-separated token lists", () => {
    expect(parseTokenList("claim_a, source_b, , assumption_c ")).toEqual(["claim_a", "source_b", "assumption_c"]);
  });
});
