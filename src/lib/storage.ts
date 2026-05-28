import { promises as fs } from "node:fs";
import path from "node:path";
import { normalizeResearchSession, touchSession, type ResearchSession } from "@/lib/models";

const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

export async function readSessions(): Promise<ResearchSession[]> {
  await ensureStore();
  const raw = await fs.readFile(SESSIONS_FILE, "utf8");
  const parsed: unknown = JSON.parse(raw || "[]");

  if (!Array.isArray(parsed)) {
    throw new Error("sessions.json must contain an array.");
  }

  return parsed.map((session) => normalizeResearchSession(session as Partial<ResearchSession>));
}

export async function getSession(id: string): Promise<ResearchSession | null> {
  const sessions = await readSessions();
  return sessions.find((session) => session.id === id) ?? null;
}

export async function writeSessions(sessions: ResearchSession[]): Promise<void> {
  await ensureStore();
  const normalized = sessions.map((session) => normalizeResearchSession(session));
  await fs.writeFile(SESSIONS_FILE, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
}

export async function upsertSession(session: ResearchSession): Promise<ResearchSession> {
  const sessions = await readSessions();
  const saved = touchSession(session);
  const existingIndex = sessions.findIndex((candidate) => candidate.id === saved.id);

  if (existingIndex >= 0) {
    sessions[existingIndex] = saved;
  } else {
    sessions.push(saved);
  }

  await writeSessions(sessions);
  return saved;
}

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(SESSIONS_FILE);
  } catch {
    await fs.writeFile(SESSIONS_FILE, "[]\n", "utf8");
  }
}
