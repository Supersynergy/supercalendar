import { type Client, createClient } from "@libsql/client";

export type EventColor =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "orange"
  | "gray";

export interface CalEvent {
  id: number;
  title: string;
  startDate: string; // ISO
  endDate: string; // ISO
  color: EventColor;
  description: string;
}

export interface DbEnv {
  DATABASE_URL?: string;
  DATABASE_AUTH_TOKEN?: string;
}

// Resolve the connection from the CF Pages runtime env first (secrets), then the
// local `.env` (dev), then a bundled file (dev only — NOT durable on Workers).
export function resolveEnv(locals: unknown): DbEnv {
  const runtime = (locals as { runtime?: { env?: DbEnv } })?.runtime?.env ?? {};
  return {
    DATABASE_URL: runtime.DATABASE_URL ?? import.meta.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN:
      runtime.DATABASE_AUTH_TOKEN ?? import.meta.env.DATABASE_AUTH_TOKEN,
  };
}

let client: Client | null = null;
let ready: Promise<void> | null = null;

function getClient(env: DbEnv): Client {
  if (!client) {
    const url = env.DATABASE_URL ?? "file:./data/events.db";
    client = createClient({ url, authToken: env.DATABASE_AUTH_TOKEN });
  }
  return client;
}

async function ensure(env: DbEnv): Promise<Client> {
  const c = getClient(env);
  if (!ready) {
    ready = c
      .execute(
        `CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          color TEXT NOT NULL DEFAULT 'blue',
          description TEXT NOT NULL DEFAULT ''
        )`,
      )
      .then(() => undefined);
  }
  await ready;
  return c;
}

type Row = Record<string, unknown>;
function toEvent(r: Row): CalEvent {
  return {
    id: Number(r.id),
    title: String(r.title),
    startDate: String(r.start_date),
    endDate: String(r.end_date),
    color: String(r.color) as EventColor,
    description: String(r.description ?? ""),
  };
}

export async function listEvents(env: DbEnv): Promise<CalEvent[]> {
  const c = await ensure(env);
  const rs = await c.execute("SELECT * FROM events ORDER BY start_date");
  return rs.rows.map(r => toEvent(r as Row));
}

export interface EventInput {
  title: string;
  startDate: string;
  endDate: string;
  color: EventColor;
  description?: string;
}

export async function createEvent(
  env: DbEnv,
  e: EventInput,
): Promise<CalEvent> {
  const c = await ensure(env);
  const rs = await c.execute({
    sql: "INSERT INTO events (title, start_date, end_date, color, description) VALUES (?, ?, ?, ?, ?) RETURNING *",
    args: [e.title, e.startDate, e.endDate, e.color, e.description ?? ""],
  });
  return toEvent(rs.rows[0] as Row);
}

export async function deleteEvent(env: DbEnv, id: number): Promise<void> {
  const c = await ensure(env);
  await c.execute({ sql: "DELETE FROM events WHERE id = ?", args: [id] });
}
