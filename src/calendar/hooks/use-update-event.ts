import { useCalendar } from "@/calendar/contexts/calendar-context";
import type { IEvent } from "@/calendar/interfaces";

export function useUpdateEvent() {
  const { setLocalEvents } = useCalendar();

  // Optimistic update (keeps drag-to-reschedule and the edit form instant), then
  // persists to the shared store in the background.
  const updateEvent = (event: IEvent) => {
    const startDate = new Date(event.startDate).toISOString();
    const endDate = new Date(event.endDate).toISOString();
    const updated: IEvent = { ...event, startDate, endDate };

    setLocalEvents(prev => {
      const index = prev.findIndex(e => e.id === event.id);
      if (index === -1) return prev;
      return [...prev.slice(0, index), updated, ...prev.slice(index + 1)];
    });

    fetch(`/api/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: event.title, startDate, endDate, color: event.color, description: event.description, userId: event.user.id }),
    }).catch(() => {
      // Network/store failure — a refresh re-syncs from the server.
    });
  };

  return { updateEvent };
}
