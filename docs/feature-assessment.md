# SuperCalendar — Feature Assessment (2026-06-06)

What the calendar still needs to be a *real* product, ranked by leverage. Sourced
from a market sweep (ghmax over GitHub specs, web search of 2026 calendar-app
reviews: reclaim, toolradar, morgen, agendacraft, novacal) + Synapse recall.

The recurring signal across every source: **the date is the easy part — the hard,
most-demanded parts are timezones, recurrence, sync, and reminders.**

---

## Just shipped (this pass)

- i18n: 50-language date localization (date-fns) + RTL + 12h/24h + EN/DE UI strings.
- Event-dialog keyboard nav (`↑`/`↓`/`E`) + fade-in + selectable text.

These cover the "culturally adaptable" half of i18n. The rest below is product depth.

---

## Tier 1 — "real calendar" trio (do first, highest demand)

| Gap | Why it matters | Suggested integration |
|-----|----------------|-----------------------|
| **Timezones** | #1 pain in 2026 reviews; events today are naive local ISO strings → wrong across DST/zones. | `@date-fns/tz` (v4) or `Temporal`. Store UTC + an explicit `timeZone`; render with the viewer's zone. Add a per-event TZ field + a global "display zone". |
| **Recurring events (RRULE)** | Most-requested feature; "assign recurring tasks" shows up in nearly every spec. | `rrule` lib. Add `recurrence` (RFC-5545 RRULE) to `IEvent`; expand occurrences within the visible range; edit-this / edit-all / edit-following semantics. |
| **ICS import/export + sync** | Users expect Google/Outlook/iCloud interop; without it the calendar is an island. | `ics` (export) + `node-ical` (import). Start with `.ics` download/upload, then OAuth two-way sync as a service. |

## Tier 2 — engagement & trust

- **Reminders / notifications** — push (Web Push / service worker) + email; per-event lead time. Drives daily-active use.
- **Real persistence** — `add`/`edit` are demo-only (no create hook, local mock). Wire a backend (the README's "submit to API" TODO) so changes survive reload.
- **Search & filter** — find events by title/person/color; filter the views.
- **Conflict / overlap detection** — warn on double-booking; the week/day view already computes overlaps for layout, so the data is there.

## Tier 3 — differentiators

- **Natural-language input** — "Lunch with Sam tomorrow 1–2pm" → parsed event (Fantastical-class wow). `chrono-node` for parsing.
- **AI smart-scheduling** — find-a-slot, auto-reschedule around working hours (already modeled), focus-time protection.
- **Availability / booking links** — Calendly-style public slot picker.

## Tier 4 — polish

- **i18n UI-string depth** — translate the ~45-key catalog for the other 48 languages (dates already localize). Best via a reviewed batch translation, not hand-typing. Keys live in `src/calendar/i18n/translations.ts`; adding a language = one catalog object + registry already lists it.
- **Accessibility** — roving-tabindex keyboard nav across the month/week grid; ARIA roles on cells; focus return after dialog close.
- **PWA / offline** — installable + cached, so it opens instantly and works offline (a repeated "feels like an app" cue in the specs).
- **Mobile gestures** — swipe between periods, long-press to create.

---

## Recommended sequence

1. Timezones (unblocks correctness for everyone).
2. Recurrence (unblocks the #1 feature request).
3. Real persistence + ICS export (makes it usable beyond a demo).
4. Reminders → search → NLP → AI.

Each is an isolated vertical slice; none requires rewriting what exists.
