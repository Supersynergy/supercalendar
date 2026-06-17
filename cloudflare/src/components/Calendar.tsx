import { useEffect, useMemo, useRef, useState } from "react";
import type { CalEvent, EventColor } from "../lib/events";

const COLORS: EventColor[] = [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "orange",
  "gray",
];

const DOT: Record<EventColor, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  red: "bg-rose-500",
  yellow: "bg-amber-400",
  purple: "bg-violet-500",
  orange: "bg-orange-500",
  gray: "bg-slate-400",
};

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// 6×7 matrix of dates for the month containing `cursor`, week starts Monday.
function monthMatrix(cursor: Date): Date[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // Mon=0
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function Calendar() {
  const [cursor, setCursor] = useState(() => new Date());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null); // ymd of day being added to
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = () => {
    if (timer.current) return;
    timer.current = setTimeout(() => {
      timer.current = null;
      fetch("/api/events")
        .then(r => (r.ok ? (r.json() as Promise<CalEvent[]>) : []))
        .then(d => {
          if (Array.isArray(d)) setEvents(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 80);
  };

  // Initial load + 8s edge-safe poll (works on CF Workers; pauses when hidden).
  useEffect(() => {
    refresh();
    const iv = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 8000);
    return () => {
      clearInterval(iv);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const cells = useMemo(() => monthMatrix(cursor), [cursor]);
  const byDay = useMemo(() => {
    const m = new Map<string, CalEvent[]>();
    for (const e of events) {
      const key = e.startDate.slice(0, 10);
      (m.get(key) ?? m.set(key, []).get(key)!).push(e);
    }
    return m;
  }, [events]);

  const todayKey = ymd(new Date());
  const monthLabel = cursor.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  async function addEvent(form: {
    title: string;
    day: string;
    color: EventColor;
    description: string;
  }) {
    const start = `${form.day}T09:00:00`;
    const end = `${form.day}T10:00:00`;
    // optimistic
    const optimistic: CalEvent = {
      id: -Date.now(),
      title: form.title,
      startDate: start,
      endDate: end,
      color: form.color,
      description: form.description,
    };
    setEvents(p => [...p, optimistic]);
    setAdding(null);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        startDate: start,
        endDate: end,
        color: form.color,
        description: form.description,
      }),
    }).catch(() => null);
    if (!res?.ok) setEvents(p => p.filter(e => e.id !== optimistic.id));
    else refresh();
  }

  async function removeEvent(id: number) {
    setEvents(p => p.filter(e => e.id !== id));
    await fetch(`/api/events/${id}`, { method: "DELETE" }).catch(() => {});
    refresh();
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="font-semibold text-2xl capitalize tracking-tight text-slate-900 dark:text-slate-100">
          {monthLabel}
        </h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCursor(new Date())}
            className="rounded-lg px-3 py-1.5 font-medium text-slate-600 text-sm hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Heute
          </button>
          <button
            type="button"
            aria-label="Vorheriger Monat"
            onClick={() =>
              setCursor(c => new Date(c.getFullYear(), c.getMonth() - 1, 1))
            }
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Nächster Monat"
            onClick={() =>
              setCursor(c => new Date(c.getFullYear(), c.getMonth() + 1, 1))
            }
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ›
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-800">
        {WEEKDAYS.map(w => (
          <div
            key={w}
            className="bg-slate-50 py-2 text-center font-medium text-slate-500 text-xs dark:bg-slate-900 dark:text-slate-400"
          >
            {w}
          </div>
        ))}
        {cells.map(d => {
          const key = ymd(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const dayEvents = byDay.get(key) ?? [];
          return (
            <div
              key={key}
              className={`group relative min-h-28 bg-white p-1.5 transition-colors dark:bg-slate-950 ${inMonth ? "" : "opacity-40"}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    key === todayKey
                      ? "bg-blue-600 font-semibold text-white"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {d.getDate()}
                </span>
                <button
                  type="button"
                  aria-label="Termin hinzufügen"
                  onClick={() => setAdding(key)}
                  className="opacity-0 transition group-hover:opacity-100 rounded-md px-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                >
                  +
                </button>
              </div>
              <ul className="mt-1 space-y-1">
                {dayEvents.map(e => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => removeEvent(e.id)}
                      title={`${e.title} — klicken zum Löschen`}
                      className="flex w-full items-center gap-1.5 truncate rounded-md bg-slate-50 px-1.5 py-1 text-left text-slate-700 text-xs hover:bg-rose-50 hover:line-through dark:bg-slate-900 dark:text-slate-200"
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${DOT[e.color]}`}
                      />
                      <span className="truncate">{e.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {loading && (
        <p className="mt-3 text-center text-slate-400 text-sm">lädt…</p>
      )}

      {adding && (
        <AddDialog
          day={adding}
          onClose={() => setAdding(null)}
          onSubmit={addEvent}
        />
      )}
    </div>
  );
}

function AddDialog({
  day,
  onClose,
  onSubmit,
}: {
  day: string;
  onClose: () => void;
  onSubmit: (f: {
    title: string;
    day: string;
    color: EventColor;
    description: string;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<EventColor>("blue");
  const [description, setDescription] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={e => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="mb-1 font-semibold text-lg text-slate-900 dark:text-slate-100">
          Neuer Termin
        </h2>
        <p className="mb-4 text-slate-500 text-sm">
          {new Date(day).toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (title.trim()) onSubmit({ title: title.trim(), day, color, description });
          }}
          className="space-y-3"
        >
          {/* biome-ignore lint/a11y/noAutofocus: dialog opens on explicit user click */}
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Titel"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Beschreibung (optional)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                aria-label={c}
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full ${DOT[c]} ${color === c ? "ring-2 ring-slate-900 ring-offset-2 dark:ring-white" : ""}`}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 font-medium text-slate-600 text-sm hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
