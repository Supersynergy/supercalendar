import { useCalendar } from "@/calendar/contexts/calendar-context";
import type { IEvent } from "@/calendar/interfaces";

export function useAddEvent() {
  const { setLocalEvents } = useCalendar();

  // Optimistic create: show the event immediately under a temp id, persist to
  // the shared store in the background, then swap in the server's record (real
  // id). Rolls back if the request fails.
  const addEvent = (event: Omit<IEvent, "id">) => {
    const tempId = Date.now();
    const startDate = new Date(event.startDate).toISOString();
    const endDate = new Date(event.endDate).toISOString();
    const optimistic: IEvent = { ...event, id: tempId, startDate, endDate };

    setLocalEvents(prev => [...prev, optimistic]);

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: event.title, startDate, endDate, color: event.color, description: event.description, userId: event.user.id }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to create event");
        return res.json() as Promise<IEvent>;
      })
      .then(created => setLocalEvents(prev => prev.map(e => (e.id === tempId ? created : e))))
      .catch(() => setLocalEvents(prev => prev.filter(e => e.id !== tempId)));
  };

  return { addEvent };
}
