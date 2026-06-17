import type { APIRoute } from "astro";
import { deleteEvent, resolveEnv } from "../../../lib/events";

export const prerender = false;

export const DELETE: APIRoute = async ({ locals, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "bad id" }, { status: 400 });
  }
  await deleteEvent(resolveEnv(locals), id);
  return new Response(null, { status: 204 });
};
