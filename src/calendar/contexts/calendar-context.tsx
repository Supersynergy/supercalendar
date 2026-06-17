"use client";

import { setDefaultOptions } from "date-fns";
import { usePathname } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANGUAGE_CODE, getLanguage } from "@/calendar/i18n/locales";
import type { TranslateFn } from "@/calendar/i18n/translations";
import { translate } from "@/calendar/i18n/translations";
import type { IEvent, IUser } from "@/calendar/interfaces";
import type { TBadgeVariant, TCalendarView, TVisibleHours, TWorkingHours } from "@/calendar/types";

interface ICalendarContext {
  view: TCalendarView;
  setView: (view: TCalendarView) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: IUser["id"] | "all";
  setSelectedUserId: (userId: IUser["id"] | "all") => void;
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  users: IUser[];
  workingHours: TWorkingHours;
  setWorkingHours: Dispatch<SetStateAction<TWorkingHours>>;
  visibleHours: TVisibleHours;
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>;
  events: IEvent[];
  setLocalEvents: Dispatch<SetStateAction<IEvent[]>>;
  use24HourFormat: boolean;
  setUse24HourFormat: (value: boolean) => void;
  localeCode: string;
  setLocaleCode: (code: string) => void;
  t: TranslateFn;
}

const CalendarContext = createContext({} as ICalendarContext);

const WORKING_HOURS = {
  0: { from: 0, to: 0 },
  1: { from: 8, to: 17 },
  2: { from: 8, to: 17 },
  3: { from: 8, to: 17 },
  4: { from: 8, to: 17 },
  5: { from: 8, to: 17 },
  6: { from: 8, to: 12 },
};

const VISIBLE_HOURS = { from: 7, to: 18 };

// View <-> URL. Switching is client-side state (instant); the URL is kept in sync
// via history.pushState so deep-links and back/forward still work — no route
// navigation / RSC roundtrip / remount on every view switch.
const VIEW_PATHS: Record<TCalendarView, string> = {
  day: "/day-view",
  week: "/week-view",
  month: "/month-view",
  year: "/year-view",
  agenda: "/agenda-view",
};

function pathToView(pathname: string): TCalendarView {
  if (pathname.startsWith("/day-view")) return "day";
  if (pathname.startsWith("/week-view")) return "week";
  if (pathname.startsWith("/year-view")) return "year";
  if (pathname.startsWith("/agenda-view")) return "agenda";
  return "month";
}

export function CalendarProvider({ children, users, events }: { children: React.ReactNode; users: IUser[]; events: IEvent[] }) {
  const pathname = usePathname();

  const [view, setViewState] = useState<TCalendarView>(() => pathToView(pathname));
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>("colored");
  const [visibleHours, setVisibleHours] = useState<TVisibleHours>(VISIBLE_HOURS);
  const [workingHours, setWorkingHours] = useState<TWorkingHours>(WORKING_HOURS);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">("all");

  // 12h/24h time display preference, persisted client-side. Starts false so the
  // server and first client render match; the stored value loads after mount.
  const [use24HourFormat, setUse24HourFormatState] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("supercalendar:use24HourFormat");
    if (stored !== null) setUse24HourFormatState(stored === "true");
  }, []);

  const setUse24HourFormat = useCallback((value: boolean) => {
    setUse24HourFormatState(value);
    window.localStorage.setItem("supercalendar:use24HourFormat", String(value));
  }, []);

  // Display language. Drives both date-fns formatting (months/weekdays/week
  // start, applied globally via setDefaultOptions) and UI string translation.
  const [localeCode, setLocaleCodeState] = useState(DEFAULT_LANGUAGE_CODE);
  // date-fns setDefaultOptions mutates module-global state and is NOT reactive,
  // so bumping this version after applying it forces consumers to re-render and
  // re-run their format() calls against the new locale.
  const [localeVersion, setLocaleVersion] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem("supercalendar:locale");
    if (stored) setLocaleCodeState(stored);
  }, []);

  useEffect(() => {
    const language = getLanguage(localeCode);
    setDefaultOptions({ locale: language.locale });
    if (typeof document !== "undefined") document.documentElement.dir = language.dir;
    setLocaleVersion(v => v + 1);
  }, [localeCode]);

  const setLocaleCode = useCallback((code: string) => {
    setLocaleCodeState(code);
    window.localStorage.setItem("supercalendar:locale", code);
  }, []);

  const t = useCallback<TranslateFn>(key => translate(localeCode, key), [localeCode]);

  // Events are seeded from the server (shared SQLite/libSQL store) and held in
  // client state for instant optimistic updates. Mutations persist to the store
  // via the events API (see the use-*-event hooks); a refresh re-syncs.
  const [localEvents, setLocalEvents] = useState<IEvent[]>(events);

  // Keep client state in sync if the server-provided events change (e.g. a
  // navigation that re-runs the server fetch).
  useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  // Live sync: two layers so it works on a single Node server AND on the edge.
  //  1. SSE change ticks — instant push, but only fires when the mutation and the
  //     stream share one process (Node/Docker/Kamal single instance).
  //  2. Polling backstop — re-pulls every few seconds. This is what keeps
  //     cross-device sync working on Cloudflare Workers, where each request is an
  //     isolated invocation so the in-process pub/sub bus never reaches the
  //     stream. On Node it's a cheap redundancy behind the instant SSE layer.
  useEffect(() => {
    if (typeof window === "undefined") return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const refresh = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        fetch("/api/events")
          .then(res => (res.ok ? (res.json() as Promise<IEvent[]>) : null))
          .then(data => {
            if (Array.isArray(data)) setLocalEvents(data);
          })
          .catch(() => {});
      }, 120);
    };

    const source = typeof EventSource !== "undefined" ? new EventSource("/api/events/stream") : null;
    if (source) {
      source.onmessage = event => {
        if (event.data === "changed") refresh();
      };
    }

    // Backstop poll. Pauses while the tab is hidden to save battery/requests.
    const POLL_MS = 8000;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (timer) clearTimeout(timer);
      source?.close();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const handleSelectDate = useCallback((date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  }, []);

  const setView = useCallback((next: TCalendarView) => {
    setViewState(next);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", VIEW_PATHS[next]);
    }
  }, []);

  // Keep view in sync when the user uses browser back/forward.
  useEffect(() => {
    const onPopState = () => setViewState(pathToView(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Memoize the context value so consumers only re-render when a value they
  // actually read changes — not on every provider render.
  const value = useMemo<ICalendarContext>(
    () => ({
      view,
      setView,
      selectedDate,
      setSelectedDate: handleSelectDate,
      selectedUserId,
      setSelectedUserId,
      badgeVariant,
      setBadgeVariant,
      users,
      visibleHours,
      setVisibleHours,
      workingHours,
      setWorkingHours,
      // If you go to the refetch approach, you can remove the localEvents and pass the events directly
      events: localEvents,
      setLocalEvents,
      use24HourFormat,
      setUse24HourFormat,
      localeCode,
      setLocaleCode,
      t,
    }),
    [
      view,
      setView,
      selectedDate,
      handleSelectDate,
      selectedUserId,
      badgeVariant,
      users,
      visibleHours,
      workingHours,
      localEvents,
      use24HourFormat,
      setUse24HourFormat,
      localeCode,
      setLocaleCode,
      t,
      // Re-derive the context value (and thus re-render consumers) once a new
      // date-fns locale has been applied globally.
      localeVersion,
    ]
  );

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);
  if (!context) throw new Error("useCalendar must be used within a CalendarProvider.");
  return context;
}
