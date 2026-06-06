import { NextResponse } from "next/server";
import { eventPayloadSchema } from "@/server/db/event-payload";
import { createEvent, listEvents } from "@/server/db/events-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await listEvents());
}

export async function POST(request: Request) {
  const parsed = eventPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await createEvent(parsed.data);
  return NextResponse.json(created, { status: 201 });
}
