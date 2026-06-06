import { listEvents, listUsers } from "@/server/db/events-repo";

// Server-side data access. Reads from the shared store (SQLite/libSQL), so every
// device hitting this deployment sees the same events.
export const getEvents = async () => listEvents();

export const getUsers = async () => listUsers();
