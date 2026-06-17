import type { APIRoute } from "astro";
import {
  createEvent,
  type EventColor,
  type EventInput,
  listEvents,
  resolveEnv,
} from "../../lib/events";

export const prerender = false;

const COLORS: EventColor[] = [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "orange",
  "gray",
];

export const GET: APIRoute = async ({ locals }) => {
  const events = await listEvents(resolveEnv(locals));
  return Response.json(events);
};

export const POST: APIRoute = async ({ locals, request }) => {
  const body = (await request.json().catch(() => null)) as Partial<EventInput> | null;
  if (!body?.title || !body.startDate || !body.endDate) {
    return Response.json(
      { error: "title, startDate, endDate required" },
      { status: 400 },
    );
  }
  const color = COLORS.includes(body.color as EventColor)
    ? (body.color as EventColor)
    : "blue";
  const created = await createEvent(resolveEnv(locals), {
    title: body.title,
    startDate: body.startDate,
    endDate: body.endDate,
    color,
    description: body.description ?? "",
  });
  return Response.json(created, { status: 201 });
};
