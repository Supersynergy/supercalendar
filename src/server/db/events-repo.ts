import { eq } from "drizzle-orm";
import type { IEvent, IUser } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";
import { db, ensureDb } from "@/server/db";
import { events, users } from "@/server/db/schema";

export type TEventInput = {
  title: string;
  startDate: string;
  endDate: string;
  color: TEventColor;
  description: string;
  userId: string;
};

type EventRow = typeof events.$inferSelect;
type UserRow = typeof users.$inferSelect;

function toUser(row: UserRow): IUser {
  return { id: row.id, name: row.name, picturePath: row.picturePath };
}

function toEvent(eventRow: EventRow, userRow: UserRow | null): IEvent {
  return {
    id: eventRow.id,
    title: eventRow.title,
    startDate: eventRow.startDate,
    endDate: eventRow.endDate,
    color: eventRow.color as TEventColor,
    description: eventRow.description,
    user: userRow ? toUser(userRow) : { id: eventRow.userId, name: "Unknown", picturePath: null },
  };
}

export async function listUsers(): Promise<IUser[]> {
  await ensureDb();
  const rows = await db.select().from(users);
  return rows.map(toUser);
}

export async function listEvents(): Promise<IEvent[]> {
  await ensureDb();
  const rows = await db.select().from(events).leftJoin(users, eq(events.userId, users.id));
  return rows.map(r => toEvent(r.events, r.users));
}

async function findEvent(id: number): Promise<IEvent | null> {
  const rows = await db.select().from(events).leftJoin(users, eq(events.userId, users.id)).where(eq(events.id, id)).limit(1);
  const row = rows[0];
  return row ? toEvent(row.events, row.users) : null;
}

export async function createEvent(input: TEventInput): Promise<IEvent> {
  await ensureDb();
  const inserted = await db.insert(events).values(input).returning({ id: events.id });
  const created = await findEvent(inserted[0].id);
  if (!created) throw new Error("Failed to create event");
  return created;
}

export async function updateEvent(id: number, input: TEventInput): Promise<IEvent | null> {
  await ensureDb();
  await db.update(events).set(input).where(eq(events.id, id));
  return findEvent(id);
}

export async function deleteEvent(id: number): Promise<void> {
  await ensureDb();
  await db.delete(events).where(eq(events.id, id));
}
