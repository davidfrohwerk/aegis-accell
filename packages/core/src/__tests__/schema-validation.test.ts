import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";
import commonSchema from "../../../../schemas/common.schema.json";
import assumptionSchema from "../../../../schemas/assumption.schema.json";
import claimSchema from "../../../../schemas/claim.schema.json";
import contradictionSchema from "../../../../schemas/contradiction.schema.json";
import failureMarkerSchema from "../../../../schemas/failure-marker.schema.json";
import fatigueIndicatorSchema from "../../../../schemas/fatigue-indicator.schema.json";
import provenanceItemSchema from "../../../../schemas/provenance-item.schema.json";
import redTeamCheckpointSchema from "../../../../schemas/red-team-checkpoint.schema.json";
import researchSessionSchema from "../../../../schemas/research-session.schema.json";
import salvageWorkflowNoteSchema from "../../../../schemas/salvage-workflow-note.schema.json";
import uncertaintyMarkerSchema from "../../../../schemas/uncertainty-marker.schema.json";
import unlearningPromptSchema from "../../../../schemas/unlearning-prompt.schema.json";
import type {
  Assumption,
  Claim,
  Contradiction,
  FailureMarker,
  FatigueIndicator,
  ProvenanceItem,
  RedTeamCheckpoint,
  ResearchSession,
  SalvageWorkflowNote,
  UncertaintyMarker,
  UnlearningPrompt
} from "../types";

const entitySchemas = [
  researchSessionSchema,
  claimSchema,
  assumptionSchema,
  uncertaintyMarkerSchema,
  provenanceItemSchema,
  contradictionSchema,
  failureMarkerSchema,
  fatigueIndicatorSchema,
  redTeamCheckpointSchema,
  unlearningPromptSchema,
  salvageWorkflowNoteSchema
] as const;

const timestamp = "2026-05-28T12:00:00.000Z";
const base = {
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: "analyst@example.com"
};

const researchSession = {
  ...base,
  id: "session_001",
  title: "Model provenance stress test",
  researchQuestion: "Which claims depend on brittle provenance?",
  summary: "First pass through an adversarial research workflow.",
  status: "active",
  claimIds: ["claim_001"],
  assumptionIds: ["assumption_001"],
  uncertaintyMarkerIds: ["uncertainty_001"],
  provenanceItemIds: ["provenance_001"],
  contradictionIds: ["contradiction_001"],
  failureMarkerIds: ["failure_001"],
  fatigueIndicatorIds: ["fatigue_001"],
  redTeamCheckpointIds: ["checkpoint_001"],
  unlearningPromptIds: ["unlearning_001"],
  salvageWorkflowNoteIds: ["salvage_001"]
} satisfies ResearchSession;

const claim = {
  ...base,
  id: "claim_001",
  researchSessionId: researchSession.id,
  text: "The primary claim depends on a single interview source.",
  status: "challenged",
  confidence: "medium",
  assumptionIds: ["assumption_001"],
  uncertaintyMarkerIds: ["uncertainty_001"],
  provenanceItemIds: ["provenance_001"],
  contradictionIds: ["contradiction_001"],
  failureMarkerIds: ["failure_001"]
} satisfies Claim;

const assumption = {
  ...base,
  id: "assumption_001",
  researchSessionId: researchSession.id,
  text: "The interviewee had direct knowledge of the system.",
  status: "untested",
  confidence: "low",
  riskLevel: "high",
  uncertaintyMarkerIds: ["uncertainty_001"],
  provenanceItemIds: ["provenance_001"],
  contradictionIds: ["contradiction_001"]
} satisfies Assumption;

const uncertaintyMarker = {
  ...base,
  id: "uncertainty_001",
  researchSessionId: researchSession.id,
  text: "Source confidence drops if the interview context is second-hand.",
  status: "open",
  confidence: "high",
  claimIds: ["claim_001"],
  assumptionIds: ["assumption_001"],
  provenanceItemIds: ["provenance_001"]
} satisfies UncertaintyMarker;

const provenanceItem = {
  ...base,
  id: "provenance_001",
  researchSessionId: researchSession.id,
  title: "Interview notes",
  text: "The source described the incident from memory.",
  sourceType: "interview",
  sourceUrl: "https://example.com/source/interview-notes",
  retrievedAt: timestamp,
  status: "active",
  confidence: "medium",
  claimIds: ["claim_001"],
  assumptionIds: ["assumption_001"],
  contradictionIds: ["contradiction_001"]
} satisfies ProvenanceItem;

const contradiction = {
  ...base,
  id: "contradiction_001",
  researchSessionId: researchSession.id,
  text: "A dataset timestamp conflicts with the interview timeline.",
  status: "investigating",
  severity: "high",
  confidence: "medium",
  resolutionText: "Check original logs before accepting either source.",
  claimIds: ["claim_001"],
  assumptionIds: ["assumption_001"],
  provenanceItemIds: ["provenance_001"]
} satisfies Contradiction;

const failureMarker = {
  ...base,
  id: "failure_001",
  researchSessionId: researchSession.id,
  text: "Research path depends on one unverified source.",
  status: "potential",
  severity: "high",
  confidence: "high",
  mitigationText: "Require a second source before marking the claim supported.",
  claimIds: ["claim_001"],
  contradictionIds: ["contradiction_001"],
  fatigueIndicatorIds: ["fatigue_001"]
} satisfies FailureMarker;

const fatigueIndicator = {
  ...base,
  id: "fatigue_001",
  researchSessionId: researchSession.id,
  text: "Analyst skipped cross-checking after repeated source dead ends.",
  status: "observed",
  severity: "medium",
  confidence: "medium",
  observedAt: timestamp,
  failureMarkerIds: ["failure_001"]
} satisfies FatigueIndicator;

const redTeamCheckpoint = {
  ...base,
  id: "checkpoint_001",
  researchSessionId: researchSession.id,
  title: "Single-source dependency check",
  text: "What would invalidate this claim if the interview is unreliable?",
  status: "pending",
  dueAt: timestamp,
  claimIds: ["claim_001"],
  assumptionIds: ["assumption_001"],
  contradictionIds: ["contradiction_001"],
  failureMarkerIds: ["failure_001"]
} satisfies RedTeamCheckpoint;

const unlearningPrompt = {
  ...base,
  id: "unlearning_001",
  researchSessionId: researchSession.id,
  text: "What belief should be discarded if the dataset timestamp is authoritative?",
  status: "pending",
  claimIds: ["claim_001"],
  assumptionIds: ["assumption_001"],
  contradictionIds: ["contradiction_001"],
  salvageWorkflowNoteIds: ["salvage_001"]
} satisfies UnlearningPrompt;

const salvageWorkflowNote = {
  ...base,
  id: "salvage_001",
  researchSessionId: researchSession.id,
  title: "Preserve reusable source caveat",
  text: "Capture the single-source warning as a reusable checklist item.",
  status: "candidate",
  confidence: "medium",
  nextStep: "Convert the warning into a red-team checkpoint template.",
  claimIds: ["claim_001"],
  contradictionIds: ["contradiction_001"],
  failureMarkerIds: ["failure_001"]
} satisfies SalvageWorkflowNote;

const examples = [
  ["ResearchSession", researchSession, "title"],
  ["Claim", claim, "text"],
  ["Assumption", assumption, "text"],
  ["UncertaintyMarker", uncertaintyMarker, "text"],
  ["ProvenanceItem", provenanceItem, "title"],
  ["Contradiction", contradiction, "text"],
  ["FailureMarker", failureMarker, "text"],
  ["FatigueIndicator", fatigueIndicator, "text"],
  ["RedTeamCheckpoint", redTeamCheckpoint, "title"],
  ["UnlearningPrompt", unlearningPrompt, "text"],
  ["SalvageWorkflowNote", salvageWorkflowNote, "title"]
] as const;

function buildAjv() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  ajv.addSchema(commonSchema);
  entitySchemas.forEach((schema) => ajv.addSchema(schema));
  return ajv;
}

describe("Aegis Accell JSON schemas", () => {
  it("validates representative examples for every entity", () => {
    const ajv = buildAjv();

    examples.forEach(([schemaTitle, example]) => {
      const schema = entitySchemas.find((candidate) => candidate.title === schemaTitle);
      expect(schema, `schema exists for ${schemaTitle}`).toBeDefined();

      const validate = ajv.getSchema(schema?.$id ?? "");
      expect(validate, `validator exists for ${schemaTitle}`).toBeDefined();
      expect(validate?.(example), JSON.stringify(validate?.errors, null, 2)).toBe(true);
    });
  });

  it("rejects empty primary text or title fields", () => {
    const ajv = buildAjv();

    examples.forEach(([schemaTitle, example, primaryField]) => {
      const schema = entitySchemas.find((candidate) => candidate.title === schemaTitle);
      const validate = ajv.getSchema(schema?.$id ?? "");
      const invalid = {
        ...example,
        [primaryField]: ""
      };

      expect(validate?.(invalid), `${schemaTitle} should reject empty ${primaryField}`).toBe(false);
    });
  });

  it("rejects invalid timestamps and related entity types", () => {
    const ajv = buildAjv();
    const validate = ajv.getSchema(researchSessionSchema.$id);

    expect(
      validate?.({
        ...researchSession,
        createdAt: "not-a-date"
      })
    ).toBe(false);

    expect(
      validate?.({
        ...researchSession,
        relatedEntities: [{ entityType: "UnknownEntity", id: "unknown_001" }]
      })
    ).toBe(false);
  });

  it("rejects additional properties outside the versioned contract", () => {
    const ajv = buildAjv();
    const validate = ajv.getSchema(claimSchema.$id);

    expect(
      validate?.({
        ...claim,
        unsupportedField: true
      })
    ).toBe(false);
  });
});
