// In-process pub/sub for live event-change notifications. Mutations publish();
// the SSE endpoint subscribes each connected client. This is single-process
// (fine for one server instance — same assumption as the local SQLite store).
// For multi-instance deployments, back this with Redis/Turso change streams.

type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publish(): void {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // A dead connection — it will be cleaned up on its own cancel.
    }
  }
}
