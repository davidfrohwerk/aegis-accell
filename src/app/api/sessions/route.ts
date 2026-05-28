import { NextResponse } from "next/server";
import { createResearchSession, normalizeResearchSession, type ResearchSession } from "@/lib/models";
import { readSessions, upsertSession } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  try {
    const sessions = await readSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<ResearchSession>;
    const session = createResearchSession(payload);
    const saved = await upsertSession(session);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as Partial<ResearchSession>;
    const session = normalizeResearchSession(payload);
    const saved = await upsertSession(session);
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
