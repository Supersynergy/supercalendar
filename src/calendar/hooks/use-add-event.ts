import { useCalendar } from "@/calendar/contexts/calendar-context";
import type { IEvent } from "@/calendar/interfaces";

export function useAddEvent() {
  const { setLocalEvents } = useCalendar();

  // Example client-side create. In a real app this would POST to an API and
  // refetch; here it appends to the persisted local store.
  const addEvent = (event: Omit<IEvent, "id">) => {
    const newEvent: IEvent = {
      ...event,
      id: Date.now(),
      startDate: new Date(event.startDate).toISOString(),
      endDate: new Date(event.endDate).toISOString(),
    };

    setLocalEvents(prev => [...prev, newEvent]);
  };

  return { addEvent };
}
