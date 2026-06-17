import { type Client, createClient } from "@libsql/client";

export type EventColor = "blue" | "green" | "red" | "yellow" | "purple" | "orange" | "gray";

export interface CalEvent {
  id: number;
  title: string;
  startDate: string; // ISO
  endDate: string; // ISO
  color: EventColor;
  description: string;
}

// --- Minimal D1 types (avoid a @cloudflare/workers-types dep) ---------------
interface D1PreparedStatement {
  bind(...vals: unknown[]): D1PreparedStatement;
  all<T = Row>(): Promise<{ results: T[] }>;
  first<T = Row>(): Promise<T | null>;
  run(): Promise<unknown>;
}
interface D1Database {
  prepare(q: string): D1PreparedStatement;
}

export interface RuntimeEnv {
  /** Cloudflare D1 binding — the DEFAULT store on CF (e.g. test data). */
  DB?: D1Database;
  /** External SQL (Turso/libSQL) — opt-in for real apps. When set, it WINS. */
  DATABASE_URL?: string;
  DATABASE_AUTH_TOKEN?: string;
}

type Row = Record<string, unknown>;

// --- Backend abstraction -----------------------------------------------------
interface Backend {
  ddl(sql: string): Promise<void>;
  all(sql: string): Promise<Row[]>;
  get(sql: string, args: unknown[]): Promise<Row | undefined>;
  run(sql: string, args: unknown[]): Promise<void>;
}

function d1Backend(DB: D1Database): Backend {
  return {
    async ddl(sql) {
      await DB.prepare(sql).run();
    },
    async all(sql) {
      const { results } = await DB.prepare(sql).all<Row>();
      return results;
    },
    async get(sql, args) {
      return (
        (await DB.prepare(sql)
          .bind(...args)
          .first<Row>()) ?? undefined
      );
    },
    async run(sql, args) {
      await DB.prepare(sql)
        .bind(...args)
        .run();
    },
  };
}

function libsqlBackend(url: string, authToken?: string): Backend {
  const client: Client = createClient({ url, authToken });
  return {
    async ddl(sql) {
      await client.execute(sql);
    },
    async all(sql) {
      const rs = await client.execute(sql);
      return rs.rows as unknown as Row[];
    },
    async get(sql, args) {
      const rs = await client.execute({ sql, args: args as never[] });
      return (rs.rows[0] as unknown as Row) ?? undefined;
    },
    async run(sql, args) {
      await client.execute({ sql, args: args as never[] });
    },
  };
}

// Selection policy:
//   1. DATABASE_URL set -> external SQL (Turso/libSQL) — real apps opt-in, WINS.
//   2. else D1 binding  -> Cloudflare D1 — DEFAULT on CF (test data).
//   3. else             -> local file SQLite — pure local dev fallback.
// On Cloudflare, external SQL is OFF by default; set DATABASE_URL to switch.
function pick(env: RuntimeEnv): Backend {
  if (env.DATABASE_URL) return libsqlBackend(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN);
  if (env.DB) return d1Backend(env.DB);
  return libsqlBackend("file:./data/events.db");
}

export function activeStore(env: RuntimeEnv): "external" | "d1" | "file" {
  if (env.DATABASE_URL) return "external";
  if (env.DB) return "d1";
  return "file";
}

let backend: Backend | null = null;
let ready: Promise<void> | null = null;

async function ensure(env: RuntimeEnv): Promise<Backend> {
  if (!backend) backend = pick(env);
  if (!ready) {
    ready = backend
      .ddl(
        `CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          color TEXT NOT NULL DEFAULT 'blue',
          description TEXT NOT NULL DEFAULT ''
        )`
      )
      .then(() => undefined);
  }
  await ready;
  return backend;
}

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

// Resolve the env: CF runtime bindings (DB + secrets) first, then local `.env`.
export function resolveEnv(locals: unknown): RuntimeEnv {
  const r = (locals as { runtime?: { env?: RuntimeEnv } })?.runtime?.env ?? {};
  return {
    DB: r.DB,
    DATABASE_URL: r.DATABASE_URL ?? import.meta.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: r.DATABASE_AUTH_TOKEN ?? import.meta.env.DATABASE_AUTH_TOKEN,
  };
}

export async function listEvents(env: RuntimeEnv): Promise<CalEvent[]> {
  const b = await ensure(env);
  const rows = await b.all("SELECT * FROM events ORDER BY start_date");
  return rows.map(toEvent);
}

export interface EventInput {
  title: string;
  startDate: string;
  endDate: string;
  color: EventColor;
  description?: string;
}

export async function createEvent(env: RuntimeEnv, e: EventInput): Promise<CalEvent> {
  const b = await ensure(env);
  const row = await b.get("INSERT INTO events (title, start_date, end_date, color, description) VALUES (?, ?, ?, ?, ?) RETURNING *", [
    e.title,
    e.startDate,
    e.endDate,
    e.color,
    e.description ?? "",
  ]);
  if (!row) throw new Error("insert failed");
  return toEvent(row);
}

export async function deleteEvent(env: RuntimeEnv, id: number): Promise<void> {
  const b = await ensure(env);
  await b.run("DELETE FROM events WHERE id = ?", [id]);
}
