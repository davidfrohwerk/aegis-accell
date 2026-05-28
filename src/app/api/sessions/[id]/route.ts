import { NextResponse } from "next/server";
import { normalizeResearchSession, type ResearchSession } from "@/lib/models";
import { getSession, upsertSession } from "@/lib/storage";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const session = await getSession(id);

    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const payload = (await request.json()) as Partial<ResearchSession>;
    const session = normalizeResearchSession({
      ...payload,
      id
    });
    const saved = await upsertSession(session);
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
