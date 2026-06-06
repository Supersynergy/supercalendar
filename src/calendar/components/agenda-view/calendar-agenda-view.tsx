"use client";

import { endOfDay, format, isSameMonth, parseISO, startOfDay } from "date-fns";
import { CalendarX2, Download, Trash2, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { AgendaDayGroup } from "@/calendar/components/agenda-view/agenda-day-group";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { downloadICS } from "@/calendar/ics";
import type { IEvent } from "@/calendar/interfaces";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

export function CalendarAgendaView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate, events, setLocalEvents } = useCalendar();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const eventsByDay = useMemo(() => {
    const allDates = new Map<string, { date: Date; events: IEvent[]; multiDayEvents: IEvent[] }>();

    singleDayEvents.forEach(event => {
      const eventDate = parseISO(event.startDate);
      if (!isSameMonth(eventDate, selectedDate)) return;

      const dateKey = format(eventDate, "yyyy-MM-dd");

      if (!allDates.has(dateKey)) {
        allDates.set(dateKey, { date: startOfDay(eventDate), events: [], multiDayEvents: [] });
      }

      allDates.get(dateKey)?.events.push(event);
    });

    multiDayEvents.forEach(event => {
      const eventStart = parseISO(event.startDate);
      const eventEnd = parseISO(event.endDate);

      let currentDate = startOfDay(eventStart);
      const lastDate = endOfDay(eventEnd);

      while (currentDate <= lastDate) {
        if (isSameMonth(currentDate, selectedDate)) {
          const dateKey = format(currentDate, "yyyy-MM-dd");

          if (!allDates.has(dateKey)) {
            allDates.set(dateKey, { date: new Date(currentDate), events: [], multiDayEvents: [] });
          }

          allDates.get(dateKey)?.multiDayEvents.push(event);
        }
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }
    });

    return Array.from(allDates.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [singleDayEvents, multiDayEvents, selectedDate]);

  const visibleIds = useMemo(() => {
    const ids = new Set<number>();
    for (const e of singleDayEvents) {
      if (isSameMonth(parseISO(e.startDate), selectedDate)) ids.add(e.id);
    }
    for (const e of multiDayEvents) ids.add(e.id);
    return ids;
  }, [singleDayEvents, multiDayEvents, selectedDate]);

  const hasAnyEvents = singleDayEvents.length > 0 || multiDayEvents.length > 0;
  const selectedCount = selectedIds.size;

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);
  const selectAll = useCallback(() => setSelectedIds(new Set(visibleIds)), [visibleIds]);

  const duplicateEvent = useCallback(
    (id: number) => {
      setLocalEvents(prev => {
        const source = prev.find(e => e.id === id);
        if (!source) return prev;
        const nextId = prev.reduce((max, e) => Math.max(max, e.id), 0) + 1;
        return [...prev, { ...source, id: nextId, title: `${source.title} (Kopie)` }];
      });
    },
    [setLocalEvents]
  );

  const deleteEvent = useCallback(
    (id: number) => {
      setLocalEvents(prev => prev.filter(e => e.id !== id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [setLocalEvents]
  );

  const updateTitle = useCallback(
    (id: number, title: string) => {
      setLocalEvents(prev => prev.map(e => (e.id === id ? { ...e, title } : e)));
    },
    [setLocalEvents]
  );

  const deleteSelected = useCallback(() => {
    setLocalEvents(prev => prev.filter(e => !selectedIds.has(e.id)));
    clearSelection();
  }, [selectedIds, setLocalEvents, clearSelection]);

  const exportSelected = useCallback(() => {
    const chosen = events.filter(e => selectedIds.has(e.id));
    if (chosen.length > 0) downloadICS(chosen, `supercalendar-${format(selectedDate, "yyyy-MM")}.ics`);
  }, [events, selectedIds, selectedDate]);

  return (
    <div className="flex h-[800px] flex-col">
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-4 py-2 text-sm">
          <span className="font-medium">{selectedCount} ausgewählt</span>
          <Button type="button" size="sm" variant="ghost" onClick={selectAll}>
            Alle ({visibleIds.size})
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={exportSelected}>
              <Download className="size-4" />
              Export .ics
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={deleteSelected}>
              <Trash2 className="size-4" />
              Löschen
            </Button>
            <Button type="button" size="icon" variant="ghost" aria-label="Auswahl aufheben" onClick={clearSelection}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="h-full" type="always">
        <div className="space-y-6 p-4">
          {eventsByDay.map(dayGroup => (
            <AgendaDayGroup
              key={format(dayGroup.date, "yyyy-MM-dd")}
              date={dayGroup.date}
              events={dayGroup.events}
              multiDayEvents={dayGroup.multiDayEvents}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onDuplicate={duplicateEvent}
              onDelete={deleteEvent}
              onUpdateTitle={updateTitle}
            />
          ))}

          {!hasAnyEvents && (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
              <CalendarX2 className="size-10" />
              <p className="text-sm md:text-base">No events scheduled for the selected month</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
