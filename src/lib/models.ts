export const SESSION_STATUSES = ["draft", "active", "paused", "complete", "archived"] as const;
export const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export const EVIDENCE_STRENGTHS = ["weak", "mixed", "strong"] as const;
export const RISK_LEVELS = ["low", "medium", "high"] as const;
export const ASSUMPTION_STATUSES = ["untested", "validated", "invalidated"] as const;
export const SOURCE_TYPES = ["article", "paper", "dataset", "interview", "internal", "other"] as const;
export const SEVERITY_LEVELS = ["low", "medium", "high", "critical"] as const;
export const RESOLUTION_STATUSES = ["open", "investigating", "resolved", "accepted"] as const;
export const CHECKPOINT_STATUSES = ["pending", "passed", "failed"] as const;
export const SALVAGE_STATUSES = ["candidate", "in_progress", "applied", "discarded"] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];
export type EvidenceStrength = (typeof EVIDENCE_STRENGTHS)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];
export type AssumptionStatus = (typeof ASSUMPTION_STATUSES)[number];
export type SourceType = (typeof SOURCE_TYPES)[number];
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];
export type ResolutionStatus = (typeof RESOLUTION_STATUSES)[number];
export type CheckpointStatus = (typeof CHECKPOINT_STATUSES)[number];
export type SalvageStatus = (typeof SALVAGE_STATUSES)[number];

export interface TimedEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Claim extends TimedEntity {
  statement: string;
  confidence: ConfidenceLevel;
  evidenceStrength: EvidenceStrength;
  status: ResolutionStatus;
  provenanceIds: string[];
  assumptionIds: string[];
  notes: string;
}

export interface Assumption extends TimedEntity {
  statement: string;
  riskLevel: RiskLevel;
  status: AssumptionStatus;
  notes: string;
}

export interface Provenance extends TimedEntity {
  sourceTitle: string;
  sourceUrl: string;
  sourceType: SourceType;
  capturedAt: string;
  excerpt: string;
  notes: string;
}

export interface Contradiction extends TimedEntity {
  description: string;
  severity: SeverityLevel;
  status: ResolutionStatus;
  claimIds: string[];
  provenanceIds: string[];
  notes: string;
}

export interface FailureMarker extends TimedEntity {
  description: string;
  severity: SeverityLevel;
  triggered: boolean;
  mitigation: string;
  notes: string;
}

export interface RedTeamCheckpoint extends TimedEntity {
  prompt: string;
  status: CheckpointStatus;
  dueAt: string;
  notes: string;
}

export interface SalvageNote extends TimedEntity {
  originalClaimOrIdea: string;
  salvagePath: string;
  status: SalvageStatus;
  nextStep: string;
}

export interface ResearchSession extends TimedEntity {
  title: string;
  researchQuestion: string;
  status: SessionStatus;
  summary: string;
  tags: string[];
  claims: Claim[];
  assumptions: Assumption[];
  provenance: Provenance[];
  contradictions: Contradiction[];
  failureMarkers: FailureMarker[];
  redTeamCheckpoints: RedTeamCheckpoint[];
  salvageNotes: SalvageNote[];
}

export type ResearchSessionCollectionKey =
  | "claims"
  | "assumptions"
  | "provenance"
  | "contradictions"
  | "failureMarkers"
  | "redTeamCheckpoints"
  | "salvageNotes";

export interface ValidationIssue {
  path: string;
  message: string;
}

export function createResearchSession(input: Partial<ResearchSession> = {}): ResearchSession {
  return normalizeResearchSession(input);
}

export function createClaim(input: Partial<Claim> = {}): Claim {
  return normalizeClaim(input);
}

export function createAssumption(input: Partial<Assumption> = {}): Assumption {
  return normalizeAssumption(input);
}

export function createProvenance(input: Partial<Provenance> = {}): Provenance {
  return normalizeProvenance(input);
}

export function createContradiction(input: Partial<Contradiction> = {}): Contradiction {
  return normalizeContradiction(input);
}

export function createFailureMarker(input: Partial<FailureMarker> = {}): FailureMarker {
  return normalizeFailureMarker(input);
}

export function createRedTeamCheckpoint(input: Partial<RedTeamCheckpoint> = {}): RedTeamCheckpoint {
  return normalizeRedTeamCheckpoint(input);
}

export function createSalvageNote(input: Partial<SalvageNote> = {}): SalvageNote {
  return normalizeSalvageNote(input);
}

export function normalizeResearchSession(input: Partial<ResearchSession> = {}): ResearchSession {
  const timestamp = nowIso();
  return {
    id: textOr(input.id, newId("session")),
    title: textOr(input.title, "Untitled research session").trim() || "Untitled research session",
    researchQuestion: textOr(input.researchQuestion),
    status: enumOr(input.status, SESSION_STATUSES, "draft"),
    summary: textOr(input.summary),
    tags: stringArrayOr(input.tags),
    createdAt: textOr(input.createdAt, timestamp),
    updatedAt: textOr(input.updatedAt, timestamp),
    claims: arrayOr(input.claims).map((claim) => normalizeClaim(claim)),
    assumptions: arrayOr(input.assumptions).map((assumption) => normalizeAssumption(assumption)),
    provenance: arrayOr(input.provenance).map((source) => normalizeProvenance(source)),
    contradictions: arrayOr(input.contradictions).map((contradiction) => normalizeContradiction(contradiction)),
    failureMarkers: arrayOr(input.failureMarkers).map((marker) => normalizeFailureMarker(marker)),
    redTeamCheckpoints: arrayOr(input.redTeamCheckpoints).map((checkpoint) => normalizeRedTeamCheckpoint(checkpoint)),
    salvageNotes: arrayOr(input.salvageNotes).map((note) => normalizeSalvageNote(note))
  };
}

export function normalizeClaim(input: Partial<Claim> = {}): Claim {
  const timestamp = nowIso();
  return {
    id: textOr(input.id, newId("claim")),
    statement: textOr(input.statement),
    confidence: enumOr(input.confidence, CONFIDENCE_LEVELS, "medium"),
    evidenceStrength: enumOr(input.evidenceStrength, EVIDENCE_STRENGTHS, "mixed"),
    status: enumOr(input.status, RESOLUTION_STATUSES, "open"),
    provenanceIds: stringArrayOr(input.provenanceIds),
    assumptionIds: stringArrayOr(input.assumptionIds),
    notes: textOr(input.notes),
    createdAt: textOr(input.createdAt, timestamp),
    updatedAt: textOr(input.updatedAt, timestamp)
  };
}

export function normalizeAssumption(input: Partial<Assumption> = {}): Assumption {
  const timestamp = nowIso();
  return {
    id: textOr(input.id, newId("assumption")),
    statement: textOr(input.statement),
    riskLevel: enumOr(input.riskLevel, RISK_LEVELS, "medium"),
    status: enumOr(input.status, ASSUMPTION_STATUSES, "untested"),
    notes: textOr(input.notes),
    createdAt: textOr(input.createdAt, timestamp),
    updatedAt: textOr(input.updatedAt, timestamp)
  };
}

export function normalizeProvenance(input: Partial<Provenance> = {}): Provenance {
  const timestamp = nowIso();
  return {
    id: textOr(input.id, newId("source")),
    sourceTitle: textOr(input.sourceTitle),
    sourceUrl: textOr(input.sourceUrl),
    sourceType: enumOr(input.sourceType, SOURCE_TYPES, "other"),
    capturedAt: textOr(input.capturedAt, timestamp),
    excerpt: textOr(input.excerpt),
    notes: textOr(input.notes),
    createdAt: textOr(input.createdAt, timestamp),
    updatedAt: textOr(input.updatedAt, timestamp)
  };
}

export function normalizeContradiction(input: Partial<Contradiction> = {}): Contradiction {
  const timestamp = nowIso();
  return {
    id: textOr(input.id, newId("contradiction")),
    description: textOr(input.description),
    severity: enumOr(input.severity, SEVERITY_LEVELS, "medium"),
    status: enumOr(input.status, RESOLUTION_STATUSES, "open"),
    claimIds: stringArrayOr(input.claimIds),
    provenanceIds: stringArrayOr(input.provenanceIds),
    notes: textOr(input.notes),
    createdAt: textOr(input.createdAt, timestamp),
    updatedAt: textOr(input.updatedAt, timestamp)
  };
}

export function normalizeFailureMarker(input: Partial<FailureMarker> = {}): FailureMarker {
  const timestamp = nowIso();
  return {
    id: textOr(input.id, newId("failure")),
    description: textOr(input.description),
    severity: enumOr(input.severity, SEVERITY_LEVELS, "medium"),
    triggered: Boolean(input.triggered),
    mitigation: textOr(input.mitigation),
    notes: textOr(input.notes),
    createdAt: textOr(input.createdAt, timestamp),
    updatedAt: textOr(input.updatedAt, timestamp)
  };
}

export function normalizeRedTeamCheckpoint(input: Partial<RedTeamCheckpoint> = {}): RedTeamCheckpoint {
  const timestamp = nowIso();
  return {
    id: textOr(input.id, newId("checkpoint")),
    prompt: textOr(input.prompt),
    status: enumOr(input.status, CHECKPOINT_STATUSES, "pending"),
    dueAt: textOr(input.dueAt),
    notes: textOr(input.notes),
    createdAt: textOr(input.createdAt, timestamp),
    updatedAt: textOr(input.updatedAt, timestamp)
  };
}

export function normalizeSalvageNote(input: Partial<SalvageNote> = {}): SalvageNote {
  const timestamp = nowIso();
  return {
    id: textOr(input.id, newId("salvage")),
    originalClaimOrIdea: textOr(input.originalClaimOrIdea),
    salvagePath: textOr(input.salvagePath),
    status: enumOr(input.status, SALVAGE_STATUSES, "candidate"),
    nextStep: textOr(input.nextStep),
    createdAt: textOr(input.createdAt, timestamp),
    updatedAt: textOr(input.updatedAt, timestamp)
  };
}

export function touchSession(session: ResearchSession, timestamp = nowIso()): ResearchSession {
  return normalizeResearchSession({
    ...session,
    updatedAt: timestamp
  });
}

export function validateResearchSession(session: ResearchSession): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!session.title.trim()) {
    issues.push({ path: "title", message: "Title is required." });
  }

  if (!session.researchQuestion.trim()) {
    issues.push({ path: "researchQuestion", message: "Research question is required." });
  }

  session.claims.forEach((claim, index) => {
    if (!claim.statement.trim()) {
      issues.push({ path: `claims.${index}.statement`, message: "Claim statement is required." });
    }
  });

  session.assumptions.forEach((assumption, index) => {
    if (!assumption.statement.trim()) {
      issues.push({ path: `assumptions.${index}.statement`, message: "Assumption statement is required." });
    }
  });

  session.provenance.forEach((source, index) => {
    if (!source.sourceTitle.trim() && !source.sourceUrl.trim()) {
      issues.push({ path: `provenance.${index}.sourceTitle`, message: "A provenance source needs a title or URL." });
    }
  });

  return issues;
}

export function parseTokenList(value: string): string[] {
  return value
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
}

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  const randomId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${randomId.replace(/-/g, "").slice(0, 16)}`;
}

function textOr(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function stringArrayOr(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function arrayOr<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function enumOr<const T extends readonly string[]>(value: unknown, allowed: T, fallback: T[number]): T[number] {
  return allowed.includes(value as T[number]) ? (value as T[number]) : fallback;
}
