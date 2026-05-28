export type EntityType =
  | "ResearchSession"
  | "Claim"
  | "Assumption"
  | "UncertaintyMarker"
  | "ProvenanceItem"
  | "Contradiction"
  | "FailureMarker"
  | "FatigueIndicator"
  | "RedTeamCheckpoint"
  | "UnlearningPrompt"
  | "SalvageWorkflowNote";

export type Confidence = "unknown" | "low" | "medium" | "high";
export type Severity = "low" | "medium" | "high" | "critical";
export type RiskLevel = "low" | "medium" | "high";

export interface RelatedEntityLink {
  entityType: EntityType;
  id: string;
  label?: string;
}

export interface AegisEntityBase {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  relatedEntities?: RelatedEntityLink[];
}

export type ResearchSessionStatus = "draft" | "active" | "paused" | "completed" | "archived";

export interface ResearchSession extends AegisEntityBase {
  title: string;
  researchQuestion: string;
  summary?: string;
  status: ResearchSessionStatus;
  claimIds?: string[];
  assumptionIds?: string[];
  uncertaintyMarkerIds?: string[];
  provenanceItemIds?: string[];
  contradictionIds?: string[];
  failureMarkerIds?: string[];
  fatigueIndicatorIds?: string[];
  redTeamCheckpointIds?: string[];
  unlearningPromptIds?: string[];
  salvageWorkflowNoteIds?: string[];
}

export type ClaimStatus = "open" | "supported" | "challenged" | "rejected" | "accepted";

export interface Claim extends AegisEntityBase {
  researchSessionId: string;
  text: string;
  status: ClaimStatus;
  confidence: Confidence;
  assumptionIds?: string[];
  uncertaintyMarkerIds?: string[];
  provenanceItemIds?: string[];
  contradictionIds?: string[];
  failureMarkerIds?: string[];
}

export type AssumptionStatus = "untested" | "validated" | "invalidated" | "deprecated";

export interface Assumption extends AegisEntityBase {
  researchSessionId: string;
  text: string;
  status: AssumptionStatus;
  confidence: Confidence;
  riskLevel: RiskLevel;
  uncertaintyMarkerIds?: string[];
  provenanceItemIds?: string[];
  contradictionIds?: string[];
}

export type UncertaintyMarkerStatus = "open" | "monitoring" | "resolved" | "accepted";

export interface UncertaintyMarker extends AegisEntityBase {
  researchSessionId: string;
  text: string;
  status: UncertaintyMarkerStatus;
  confidence: Confidence;
  claimIds?: string[];
  assumptionIds?: string[];
  provenanceItemIds?: string[];
}

export type ProvenanceSourceType = "article" | "paper" | "dataset" | "interview" | "internal" | "observation" | "other";
export type ProvenanceItemStatus = "active" | "superseded" | "disputed" | "retracted";

export interface ProvenanceItem extends AegisEntityBase {
  researchSessionId: string;
  title: string;
  text?: string;
  sourceType: ProvenanceSourceType;
  sourceUrl?: string;
  retrievedAt?: string;
  status: ProvenanceItemStatus;
  confidence: Confidence;
  claimIds?: string[];
  assumptionIds?: string[];
  contradictionIds?: string[];
}

export type ContradictionStatus = "open" | "investigating" | "resolved" | "accepted";

export interface Contradiction extends AegisEntityBase {
  researchSessionId: string;
  text: string;
  status: ContradictionStatus;
  severity: Severity;
  confidence: Confidence;
  resolutionText?: string;
  claimIds?: string[];
  assumptionIds?: string[];
  provenanceItemIds?: string[];
}

export type FailureMarkerStatus = "potential" | "triggered" | "mitigated" | "accepted";

export interface FailureMarker extends AegisEntityBase {
  researchSessionId: string;
  text: string;
  status: FailureMarkerStatus;
  severity: Severity;
  confidence: Confidence;
  mitigationText?: string;
  claimIds?: string[];
  contradictionIds?: string[];
  fatigueIndicatorIds?: string[];
}

export type FatigueIndicatorStatus = "observed" | "monitoring" | "resolved" | "accepted";

export interface FatigueIndicator extends AegisEntityBase {
  researchSessionId: string;
  text: string;
  status: FatigueIndicatorStatus;
  severity: Severity;
  confidence: Confidence;
  observedAt?: string;
  failureMarkerIds?: string[];
}

export type RedTeamCheckpointStatus = "pending" | "in_progress" | "passed" | "failed" | "skipped";

export interface RedTeamCheckpoint extends AegisEntityBase {
  researchSessionId: string;
  title: string;
  text: string;
  status: RedTeamCheckpointStatus;
  dueAt?: string;
  completedAt?: string;
  claimIds?: string[];
  assumptionIds?: string[];
  contradictionIds?: string[];
  failureMarkerIds?: string[];
}

export type UnlearningPromptStatus = "pending" | "in_progress" | "completed" | "dismissed";

export interface UnlearningPrompt extends AegisEntityBase {
  researchSessionId: string;
  text: string;
  status: UnlearningPromptStatus;
  claimIds?: string[];
  assumptionIds?: string[];
  contradictionIds?: string[];
  salvageWorkflowNoteIds?: string[];
}

export type SalvageWorkflowNoteStatus = "candidate" | "in_progress" | "applied" | "discarded";

export interface SalvageWorkflowNote extends AegisEntityBase {
  researchSessionId: string;
  title: string;
  text: string;
  status: SalvageWorkflowNoteStatus;
  confidence: Confidence;
  nextStep?: string;
  claimIds?: string[];
  contradictionIds?: string[];
  failureMarkerIds?: string[];
}

export type AegisEntity =
  | ResearchSession
  | Claim
  | Assumption
  | UncertaintyMarker
  | ProvenanceItem
  | Contradiction
  | FailureMarker
  | FatigueIndicator
  | RedTeamCheckpoint
  | UnlearningPrompt
  | SalvageWorkflowNote;
