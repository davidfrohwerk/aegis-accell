import type {
  Assumption,
  Claim,
  Contradiction,
  FailureMarker,
  Provenance,
  RedTeamCheckpoint,
  ResearchSession,
  SalvageNote
} from "@/lib/models";

export function exportSessionToJson(session: ResearchSession): string {
  return `${JSON.stringify(session, null, 2)}\n`;
}

export function exportSessionToMarkdown(session: ResearchSession): string {
  return [
    `# ${line(session.title)}`,
    "",
    metadata(session),
    "",
    section("Research Question", paragraph(session.researchQuestion)),
    section("Summary", paragraph(session.summary)),
    section("Claims", session.claims.length ? session.claims.map(formatClaim).join("\n\n") : "_None yet._"),
    section("Assumptions", session.assumptions.length ? session.assumptions.map(formatAssumption).join("\n\n") : "_None yet._"),
    section("Provenance", session.provenance.length ? session.provenance.map(formatProvenance).join("\n\n") : "_None yet._"),
    section(
      "Contradictions",
      session.contradictions.length ? session.contradictions.map(formatContradiction).join("\n\n") : "_None yet._"
    ),
    section(
      "Failure Markers",
      session.failureMarkers.length ? session.failureMarkers.map(formatFailureMarker).join("\n\n") : "_None yet._"
    ),
    section(
      "Red-Team Checkpoints",
      session.redTeamCheckpoints.length ? session.redTeamCheckpoints.map(formatCheckpoint).join("\n\n") : "_None yet._"
    ),
    section(
      "Salvage Notes",
      session.salvageNotes.length ? session.salvageNotes.map(formatSalvageNote).join("\n\n") : "_None yet._"
    )
  ].join("\n");
}

function metadata(session: ResearchSession): string {
  const tags = session.tags.length ? session.tags.join(", ") : "none";
  return [
    `- Status: ${session.status}`,
    `- Created: ${session.createdAt}`,
    `- Updated: ${session.updatedAt}`,
    `- Tags: ${tags}`
  ].join("\n");
}

function section(title: string, body: string): string {
  return `## ${title}\n\n${body}`;
}

function formatClaim(claim: Claim): string {
  return [
    `### ${line(claim.statement || "Untitled claim")}`,
    `- ID: ${claim.id}`,
    `- Status: ${claim.status}`,
    `- Confidence: ${claim.confidence}`,
    `- Evidence strength: ${claim.evidenceStrength}`,
    `- Provenance IDs: ${listOrNone(claim.provenanceIds)}`,
    `- Assumption IDs: ${listOrNone(claim.assumptionIds)}`,
    claim.notes ? `\n${line(claim.notes)}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function formatAssumption(assumption: Assumption): string {
  return [
    `### ${line(assumption.statement || "Untitled assumption")}`,
    `- ID: ${assumption.id}`,
    `- Status: ${assumption.status}`,
    `- Risk level: ${assumption.riskLevel}`,
    assumption.notes ? `\n${line(assumption.notes)}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function formatProvenance(source: Provenance): string {
  const title = source.sourceTitle || source.sourceUrl || "Untitled source";
  const linkedTitle = source.sourceUrl ? `[${line(title)}](${source.sourceUrl})` : line(title);
  return [
    `### ${linkedTitle}`,
    `- ID: ${source.id}`,
    `- Type: ${source.sourceType}`,
    `- Captured: ${source.capturedAt}`,
    source.excerpt ? `\n> ${quote(source.excerpt)}` : "",
    source.notes ? `\n${line(source.notes)}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function formatContradiction(contradiction: Contradiction): string {
  return [
    `### ${line(contradiction.description || "Untitled contradiction")}`,
    `- ID: ${contradiction.id}`,
    `- Status: ${contradiction.status}`,
    `- Severity: ${contradiction.severity}`,
    `- Claim IDs: ${listOrNone(contradiction.claimIds)}`,
    `- Provenance IDs: ${listOrNone(contradiction.provenanceIds)}`,
    contradiction.notes ? `\n${line(contradiction.notes)}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function formatFailureMarker(marker: FailureMarker): string {
  return [
    `### ${line(marker.description || "Untitled failure marker")}`,
    `- ID: ${marker.id}`,
    `- Severity: ${marker.severity}`,
    `- Triggered: ${marker.triggered ? "yes" : "no"}`,
    marker.mitigation ? `- Mitigation: ${line(marker.mitigation)}` : "",
    marker.notes ? `\n${line(marker.notes)}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function formatCheckpoint(checkpoint: RedTeamCheckpoint): string {
  return [
    `### ${line(checkpoint.prompt || "Untitled checkpoint")}`,
    `- ID: ${checkpoint.id}`,
    `- Status: ${checkpoint.status}`,
    checkpoint.dueAt ? `- Due: ${line(checkpoint.dueAt)}` : "",
    checkpoint.notes ? `\n${line(checkpoint.notes)}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function formatSalvageNote(note: SalvageNote): string {
  return [
    `### ${line(note.originalClaimOrIdea || "Untitled salvage note")}`,
    `- ID: ${note.id}`,
    `- Status: ${note.status}`,
    note.salvagePath ? `- Salvage path: ${line(note.salvagePath)}` : "",
    note.nextStep ? `- Next step: ${line(note.nextStep)}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function paragraph(value: string): string {
  return value.trim() ? line(value) : "_None yet._";
}

function listOrNone(values: string[]): string {
  return values.length ? values.join(", ") : "none";
}

function line(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

function quote(value: string): string {
  return line(value).replace(/\n/g, "\n> ");
}
