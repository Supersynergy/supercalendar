"use client";

import { isSameDay, parseISO } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarAgendaView } from "@/calendar/components/agenda-view/calendar-agenda-view";

import { DndProviderWrapper } from "@/calendar/components/dnd/dnd-provider";

import { CalendarHeader } from "@/calendar/components/header/calendar-header";
import { CalendarMonthView } from "@/calendar/components/month-view/calendar-month-view";
import { CalendarDayView } from "@/calendar/components/week-and-day-view/calendar-day-view";
import { CalendarWeekView } from "@/calendar/components/week-and-day-view/calendar-week-view";
import { CalendarYearView } from "@/calendar/components/year-view/calendar-year-view";
import { useCalendar } from "@/calendar/contexts/calendar-context";

import type { TCalendarView } from "@/calendar/types";

interface IProps {
  view: TCalendarView;
}

export function ClientContainer({ view: initialView }: IProps) {
  const { selectedDate, selectedUserId, events } = useCalendar();

  // View lives in client state so switching is instant — no route round-trip,
  // no loading skeleton. The route only seeds the initial view; we keep the URL
  // in sync shallowly so refresh/share still land on the right view.
  const [view, setView] = useState<TCalendarView>(initialView);

  const changeView = useCallback((next: TCalendarView) => {
    setView(next);
    window.history.replaceState(null, "", `/${next}-view`);
  }, []);

  // Reflect browser back/forward (which only changes the URL, not React state).
  useEffect(() => {
    const sync = () => {
      const match = window.location.pathname.match(/^\/(day|week|month|year|agenda)-view/);
      if (match) setView(match[1] as TCalendarView);
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventStartDate = parseISO(event.startDate);
      const eventEndDate = parseISO(event.endDate);

      if (view === "year") {
        const yearStart = new Date(selectedDate.getFullYear(), 0, 1);
        const yearEnd = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        const isInSelectedYear = eventStartDate <= yearEnd && eventEndDate >= yearStart;
        const isUserMatch = selectedUserId === "all" || event.user.id === selectedUserId;
        return isInSelectedYear && isUserMatch;
      }

      if (view === "month" || view === "agenda") {
        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
        const isInSelectedMonth = eventStartDate <= monthEnd && eventEndDate >= monthStart;
        const isUserMatch = selectedUserId === "all" || event.user.id === selectedUserId;
        return isInSelectedMonth && isUserMatch;
      }

      if (view === "week") {
        const dayOfWeek = selectedDate.getDay();

        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const isInSelectedWeek = eventStartDate <= weekEnd && eventEndDate >= weekStart;
        const isUserMatch = selectedUserId === "all" || event.user.id === selectedUserId;
        return isInSelectedWeek && isUserMatch;
      }

      if (view === "day") {
        const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
        const dayEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59);
        const isInSelectedDay = eventStartDate <= dayEnd && eventEndDate >= dayStart;
        const isUserMatch = selectedUserId === "all" || event.user.id === selectedUserId;
        return isInSelectedDay && isUserMatch;
      }

      return false;
    });
  }, [selectedDate, selectedUserId, events, view]);

  // Split into single- and multi-day buckets in a single pass, memoized so the
  // ISO strings are only parsed when the filtered set actually changes.
  const { singleDayEvents, multiDayEvents } = useMemo(() => {
    const single: typeof filteredEvents = [];
    const multi: typeof filteredEvents = [];

    for (const event of filteredEvents) {
      const startDate = parseISO(event.startDate);
      const endDate = parseISO(event.endDate);
      if (isSameDay(startDate, endDate)) single.push(event);
      else multi.push(event);
    }

    return { singleDayEvents: single, multiDayEvents: multi };
  }, [filteredEvents]);

  // For year view, we only care about the start date
  // by using the same date for both start and end,
  // we ensure only the start day will show a dot
  const eventStartDates = useMemo(() => {
    return filteredEvents.map(event => ({ ...event, endDate: event.startDate }));
  }, [filteredEvents]);

  return (
    <div className="overflow-hidden rounded-xl border">
      <CalendarHeader view={view} events={filteredEvents} onViewChange={changeView} />

      <DndProviderWrapper>
        {/* Views are picked from already-computed client state — instant swap, no animation, no round-trip. */}
        {view === "day" && <CalendarDayView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
        {view === "month" && <CalendarMonthView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
        {view === "week" && <CalendarWeekView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
        {view === "year" && <CalendarYearView allEvents={eventStartDates} />}
        {view === "agenda" && <CalendarAgendaView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
      </DndProviderWrapper>
    </div>
  );
}
