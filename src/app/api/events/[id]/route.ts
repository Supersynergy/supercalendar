import { NextResponse } from "next/server";
import { eventPayloadSchema } from "@/server/db/event-payload";
import { publish } from "@/server/db/events-bus";
import { deleteEvent, updateEvent } from "@/server/db/events-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const parsed = eventPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateEvent(id, parsed.data);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  publish();
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Context) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await deleteEvent(id);
  publish();
  return new NextResponse(null, { status: 204 });
}
