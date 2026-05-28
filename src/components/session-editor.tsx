"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ASSUMPTION_STATUSES,
  CHECKPOINT_STATUSES,
  CONFIDENCE_LEVELS,
  EVIDENCE_STRENGTHS,
  RESOLUTION_STATUSES,
  RISK_LEVELS,
  SALVAGE_STATUSES,
  SESSION_STATUSES,
  SEVERITY_LEVELS,
  SOURCE_TYPES,
  createAssumption,
  createClaim,
  createContradiction,
  createFailureMarker,
  createProvenance,
  createRedTeamCheckpoint,
  createResearchSession,
  createSalvageNote,
  parseTokenList,
  touchSession,
  validateResearchSession,
  type ResearchSession,
  type ResearchSessionCollectionKey
} from "@/lib/models";

type CollectionItem = ResearchSession[ResearchSessionCollectionKey][number];
type FieldKind = "text" | "textarea" | "select" | "checkbox" | "tokens";

interface FieldConfig {
  name: string;
  label: string;
  kind: FieldKind;
  options?: readonly string[];
}

interface CollectionConfig {
  key: ResearchSessionCollectionKey;
  title: string;
  addLabel: string;
  create: () => CollectionItem;
  fields: FieldConfig[];
}

const COLLECTIONS: CollectionConfig[] = [
  {
    key: "claims",
    title: "Claims",
    addLabel: "Add claim",
    create: () => createClaim(),
    fields: [
      { name: "statement", label: "Statement", kind: "textarea" },
      { name: "status", label: "Status", kind: "select", options: RESOLUTION_STATUSES },
      { name: "confidence", label: "Confidence", kind: "select", options: CONFIDENCE_LEVELS },
      { name: "evidenceStrength", label: "Evidence", kind: "select", options: EVIDENCE_STRENGTHS },
      { name: "provenanceIds", label: "Provenance IDs", kind: "tokens" },
      { name: "assumptionIds", label: "Assumption IDs", kind: "tokens" },
      { name: "notes", label: "Notes", kind: "textarea" }
    ]
  },
  {
    key: "assumptions",
    title: "Assumptions",
    addLabel: "Add assumption",
    create: () => createAssumption(),
    fields: [
      { name: "statement", label: "Statement", kind: "textarea" },
      { name: "riskLevel", label: "Risk", kind: "select", options: RISK_LEVELS },
      { name: "status", label: "Status", kind: "select", options: ASSUMPTION_STATUSES },
      { name: "notes", label: "Notes", kind: "textarea" }
    ]
  },
  {
    key: "provenance",
    title: "Provenance",
    addLabel: "Add source",
    create: () => createProvenance(),
    fields: [
      { name: "sourceTitle", label: "Title", kind: "text" },
      { name: "sourceUrl", label: "URL", kind: "text" },
      { name: "sourceType", label: "Type", kind: "select", options: SOURCE_TYPES },
      { name: "capturedAt", label: "Captured", kind: "text" },
      { name: "excerpt", label: "Excerpt", kind: "textarea" },
      { name: "notes", label: "Notes", kind: "textarea" }
    ]
  },
  {
    key: "contradictions",
    title: "Contradictions",
    addLabel: "Add contradiction",
    create: () => createContradiction(),
    fields: [
      { name: "description", label: "Description", kind: "textarea" },
      { name: "severity", label: "Severity", kind: "select", options: SEVERITY_LEVELS },
      { name: "status", label: "Status", kind: "select", options: RESOLUTION_STATUSES },
      { name: "claimIds", label: "Claim IDs", kind: "tokens" },
      { name: "provenanceIds", label: "Provenance IDs", kind: "tokens" },
      { name: "notes", label: "Notes", kind: "textarea" }
    ]
  },
  {
    key: "failureMarkers",
    title: "Failure Markers",
    addLabel: "Add marker",
    create: () => createFailureMarker(),
    fields: [
      { name: "description", label: "Description", kind: "textarea" },
      { name: "severity", label: "Severity", kind: "select", options: SEVERITY_LEVELS },
      { name: "triggered", label: "Triggered", kind: "checkbox" },
      { name: "mitigation", label: "Mitigation", kind: "textarea" },
      { name: "notes", label: "Notes", kind: "textarea" }
    ]
  },
  {
    key: "redTeamCheckpoints",
    title: "Red-Team Checkpoints",
    addLabel: "Add checkpoint",
    create: () => createRedTeamCheckpoint(),
    fields: [
      { name: "prompt", label: "Prompt", kind: "textarea" },
      { name: "status", label: "Status", kind: "select", options: CHECKPOINT_STATUSES },
      { name: "dueAt", label: "Due", kind: "text" },
      { name: "notes", label: "Notes", kind: "textarea" }
    ]
  },
  {
    key: "salvageNotes",
    title: "Salvage Notes",
    addLabel: "Add note",
    create: () => createSalvageNote(),
    fields: [
      { name: "originalClaimOrIdea", label: "Original idea", kind: "textarea" },
      { name: "salvagePath", label: "Salvage path", kind: "textarea" },
      { name: "status", label: "Status", kind: "select", options: SALVAGE_STATUSES },
      { name: "nextStep", label: "Next step", kind: "textarea" }
    ]
  }
];

export function SessionEditor() {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [current, setCurrent] = useState<ResearchSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadSessions();
  }, []);

  const validationIssues = useMemo(() => (current ? validateResearchSession(current) : []), [current]);
  const savedOnDisk = Boolean(current && sessions.some((session) => session.id === current.id));
  const canExport = Boolean(current && savedOnDisk && !dirty);

  async function loadSessions() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/sessions", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Unable to load sessions.");
      }

      const loaded = (await response.json()) as ResearchSession[];
      setSessions(loaded);

      if (loaded.length > 0) {
        setCurrent(loaded[0]);
        setDirty(false);
      } else {
        setCurrent(createResearchSession({ title: "New research session" }));
        setDirty(true);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load sessions.");
    } finally {
      setLoading(false);
    }
  }

  function createNewSession() {
    if (dirty && !window.confirm("Discard unsaved changes?")) {
      return;
    }

    setCurrent(createResearchSession({ title: "New research session" }));
    setDirty(true);
    setNotice("New session draft.");
    setError("");
  }

  function selectSession(id: string) {
    if (dirty && !window.confirm("Discard unsaved changes?")) {
      return;
    }

    const next = sessions.find((session) => session.id === id);

    if (next) {
      setCurrent(next);
      setDirty(false);
      setNotice("");
      setError("");
    }
  }

  async function saveSession(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!current) {
      return;
    }

    setSaving(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch(`/api/sessions/${current.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(current)
      });

      if (!response.ok) {
        throw new Error("Unable to save session.");
      }

      const saved = (await response.json()) as ResearchSession;
      setCurrent(saved);
      setDirty(false);
      setSessions((previous) => mergeSession(previous, saved));
      setNotice("Saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save session.");
    } finally {
      setSaving(false);
    }
  }

  function updateTopLevel(field: keyof ResearchSession, value: string | string[]) {
    setCurrent((previous) => {
      if (!previous) {
        return previous;
      }

      setDirty(true);
      return touchSession({
        ...previous,
        [field]: value
      });
    });
  }

  function addItem(config: CollectionConfig) {
    setCurrent((previous) => {
      if (!previous) {
        return previous;
      }

      const items = previous[config.key] as CollectionItem[];
      setDirty(true);
      return touchSession({
        ...previous,
        [config.key]: [...items, config.create()]
      });
    });
  }

  function removeItem(key: ResearchSessionCollectionKey, id: string) {
    setCurrent((previous) => {
      if (!previous) {
        return previous;
      }

      const items = previous[key] as CollectionItem[];
      setDirty(true);
      return touchSession({
        ...previous,
        [key]: items.filter((item) => item.id !== id)
      });
    });
  }

  function updateItem(key: ResearchSessionCollectionKey, id: string, field: string, value: string | string[] | boolean) {
    setCurrent((previous) => {
      if (!previous) {
        return previous;
      }

      const items = previous[key] as CollectionItem[];
      const timestamp = new Date().toISOString();
      setDirty(true);
      return touchSession({
        ...previous,
        [key]: items.map((item) => (item.id === id ? { ...item, [field]: value, updatedAt: timestamp } : item))
      });
    });
  }

  if (loading) {
    return (
      <main className="app-shell loading-shell">
        <p>Loading sessions...</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Saved sessions">
        <div className="sidebar-header">
          <div>
            <p className="eyebrow">Local JSON</p>
            <h1>Research Sessions</h1>
          </div>
          <button type="button" className="button primary" onClick={createNewSession}>
            New
          </button>
        </div>

        <div className="session-list">
          {sessions.length ? (
            sessions.map((session) => (
              <button
                type="button"
                className={`session-row ${current?.id === session.id ? "active" : ""}`}
                key={session.id}
                onClick={() => selectSession(session.id)}
              >
                <span>{session.title}</span>
                <small>{session.status}</small>
              </button>
            ))
          ) : (
            <p className="empty">No saved sessions</p>
          )}
        </div>
      </aside>

      {current ? (
        <form className="workspace" onSubmit={saveSession}>
          <header className="toolbar">
            <div>
              <p className="eyebrow">{dirty ? "Unsaved" : "Saved"}</p>
              <h2>{current.title}</h2>
            </div>
            <div className="actions">
              <button type="submit" className="button primary" disabled={saving}>
                {saving ? "Saving" : "Save"}
              </button>
              <a
                className={`button ${canExport ? "" : "disabled"}`}
                href={`/api/sessions/${current.id}/export/json`}
                onClick={(event) => {
                  if (!canExport) {
                    event.preventDefault();
                  }
                }}
              >
                JSON
              </a>
              <a
                className={`button ${canExport ? "" : "disabled"}`}
                href={`/api/sessions/${current.id}/export/markdown`}
                onClick={(event) => {
                  if (!canExport) {
                    event.preventDefault();
                  }
                }}
              >
                Markdown
              </a>
            </div>
          </header>

          {(notice || error) && (
            <div className={`notice ${error ? "error" : ""}`} role="status">
              {error || notice}
            </div>
          )}

          {validationIssues.length > 0 && (
            <div className="validation" aria-label="Validation issues">
              {validationIssues.slice(0, 4).map((issue) => (
                <span key={`${issue.path}-${issue.message}`}>{issue.message}</span>
              ))}
            </div>
          )}

          <section className="session-fields" aria-label="Session details">
            <label>
              <span>Title</span>
              <input value={current.title} onChange={(event) => updateTopLevel("title", event.target.value)} />
            </label>

            <label>
              <span>Status</span>
              <select value={current.status} onChange={(event) => updateTopLevel("status", event.target.value)}>
                {SESSION_STATUSES.map((status) => (
                  <option value={status} key={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="wide">
              <span>Tags</span>
              <input value={current.tags.join(", ")} onChange={(event) => updateTopLevel("tags", parseTokenList(event.target.value))} />
            </label>

            <label className="wide">
              <span>Research question</span>
              <textarea
                value={current.researchQuestion}
                onChange={(event) => updateTopLevel("researchQuestion", event.target.value)}
              />
            </label>

            <label className="wide">
              <span>Summary</span>
              <textarea value={current.summary} onChange={(event) => updateTopLevel("summary", event.target.value)} />
            </label>
          </section>

          <div className="collections">
            {COLLECTIONS.map((config) => {
              const items = current[config.key] as CollectionItem[];

              return (
                <section className="collection" key={config.key}>
                  <div className="collection-header">
                    <h3>{config.title}</h3>
                    <div className="collection-actions">
                      <span>{items.length}</span>
                      <button type="button" className="button small" onClick={() => addItem(config)}>
                        {config.addLabel}
                      </button>
                    </div>
                  </div>

                  <div className="item-list">
                    {items.length ? (
                      items.map((item) => (
                        <article className="item-card" key={item.id}>
                          <div className="item-meta">
                            <code>{item.id}</code>
                            <button type="button" className="button ghost small" onClick={() => removeItem(config.key, item.id)}>
                              Remove
                            </button>
                          </div>
                          <div className="item-grid">{config.fields.map((field) => renderField(config.key, item, field, updateItem))}</div>
                        </article>
                      ))
                    ) : (
                      <p className="empty">None</p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </form>
      ) : (
        <section className="workspace empty-workspace">
          <button type="button" className="button primary" onClick={createNewSession}>
            New session
          </button>
        </section>
      )}
    </main>
  );
}

function renderField(
  key: ResearchSessionCollectionKey,
  item: CollectionItem,
  field: FieldConfig,
  updateItem: (key: ResearchSessionCollectionKey, id: string, field: string, value: string | string[] | boolean) => void
) {
  const record = item as unknown as Record<string, unknown>;
  const fieldId = `${item.id}-${field.name}`;
  const value = record[field.name];

  if (field.kind === "checkbox") {
    return (
      <label className="checkbox-field" htmlFor={fieldId} key={field.name}>
        <input
          id={fieldId}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => updateItem(key, item.id, field.name, event.target.checked)}
        />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.kind === "select") {
    return (
      <label key={field.name}>
        <span>{field.label}</span>
        <select value={String(value ?? "")} onChange={(event) => updateItem(key, item.id, field.name, event.target.value)}>
          {field.options?.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.kind === "textarea") {
    return (
      <label className="wide" key={field.name}>
        <span>{field.label}</span>
        <textarea value={String(value ?? "")} onChange={(event) => updateItem(key, item.id, field.name, event.target.value)} />
      </label>
    );
  }

  if (field.kind === "tokens") {
    return (
      <label key={field.name}>
        <span>{field.label}</span>
        <input
          value={Array.isArray(value) ? value.join(", ") : ""}
          onChange={(event) => updateItem(key, item.id, field.name, parseTokenList(event.target.value))}
        />
      </label>
    );
  }

  return (
    <label key={field.name}>
      <span>{field.label}</span>
      <input value={String(value ?? "")} onChange={(event) => updateItem(key, item.id, field.name, event.target.value)} />
    </label>
  );
}

function mergeSession(sessions: ResearchSession[], saved: ResearchSession): ResearchSession[] {
  const index = sessions.findIndex((session) => session.id === saved.id);

  if (index < 0) {
    return [saved, ...sessions];
  }

  return sessions.map((session) => (session.id === saved.id ? saved : session));
}
