"use client";

import { setDefaultOptions } from "date-fns";
import type { Dispatch, SetStateAction } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANGUAGE_CODE, getLanguage } from "@/calendar/i18n/locales";
import type { TranslateFn } from "@/calendar/i18n/translations";
import { translate } from "@/calendar/i18n/translations";
import type { IEvent, IUser } from "@/calendar/interfaces";
import type { TBadgeVariant, TVisibleHours, TWorkingHours } from "@/calendar/types";

interface ICalendarContext {
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

export function CalendarProvider({ children, users, events }: { children: React.ReactNode; users: IUser[]; events: IEvent[] }) {
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

  // Live sync: subscribe to server-sent change ticks and re-pull the shared
  // store, so a mutation on one device shows up on every other device in real
  // time (no refresh needed).
  useEffect(() => {
    if (typeof window === "undefined" || typeof EventSource === "undefined") return;

    const source = new EventSource("/api/events/stream");
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

    source.onmessage = event => {
      if (event.data === "changed") refresh();
    };

    return () => {
      if (timer) clearTimeout(timer);
      source.close();
    };
  }, []);

  const handleSelectDate = useCallback((date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  }, []);

  // Memoize the context value so consumers only re-render when a value they
  // actually read changes — not on every provider render.
  const value = useMemo<ICalendarContext>(
    () => ({
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
