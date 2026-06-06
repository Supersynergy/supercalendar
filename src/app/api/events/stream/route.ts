import { subscribe } from "@/server/db/events-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Server-Sent Events: pushes a "changed" tick whenever any event is mutated, so
// every connected device re-syncs in real time.
export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => controller.enqueue(encoder.encode(`data: ${data}\n\n`));

      send("connected");
      const unsubscribe = subscribe(() => send("changed"));

      // Heartbeat keeps proxies from closing the idle connection.
      const heartbeat = setInterval(() => send("ping"), 25000);

      const close = () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
