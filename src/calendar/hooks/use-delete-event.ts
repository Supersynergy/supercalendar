import { useCalendar } from "@/calendar/contexts/calendar-context";
import type { IEvent } from "@/calendar/interfaces";

export function useDeleteEvent() {
  const { setLocalEvents } = useCalendar();

  // Optimistic delete with rollback if the store rejects it.
  const deleteEvent = (id: IEvent["id"]) => {
    let removed: IEvent | undefined;

    setLocalEvents(prev => {
      removed = prev.find(e => e.id === id);
      return prev.filter(e => e.id !== id);
    });

    fetch(`/api/events/${id}`, { method: "DELETE" }).catch(() => {
      if (removed) setLocalEvents(prev => (prev.some(e => e.id === id) ? prev : [...prev, removed as IEvent]));
    });
  };

  return { deleteEvent };
}
