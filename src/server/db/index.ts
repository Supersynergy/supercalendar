import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { CALENDAR_ITEMS_MOCK, USERS_MOCK } from "@/calendar/mocks";
import * as schema from "@/server/db/schema";

// Shared store. Defaults to a local SQLite file (cross-device when the app runs
// on one server); point DATABASE_URL at a Turso/libSQL URL for cloud sync.
const url = process.env.DATABASE_URL ?? "file:./data/supercalendar.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });

// Lazily create tables + seed once per process.
let ready: Promise<void> | null = null;

export function ensureDb(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}

async function init(): Promise<void> {
  await client.batch(
    [
      "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, picture_path TEXT)",
      "CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL, color TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', user_id TEXT NOT NULL)",
    ],
    "write"
  );

  const existing = await db.select({ id: schema.users.id }).from(schema.users).limit(1);
  if (existing.length > 0) return;

  // First boot: seed users + the demo events so the calendar isn't empty.
  await db.insert(schema.users).values(USERS_MOCK.map(u => ({ id: u.id, name: u.name, picturePath: u.picturePath })));

  if (CALENDAR_ITEMS_MOCK.length > 0) {
    await db.insert(schema.events).values(
      CALENDAR_ITEMS_MOCK.map(e => ({
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate,
        color: e.color,
        description: e.description,
        userId: e.user.id,
      }))
    );
  }
}
