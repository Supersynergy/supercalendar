<div align="center">

# 📅 SuperCalendar

**A feature-rich, high-performance calendar for Next.js — five views, drag & drop, dark mode.**

A [SuperSynergy](https://github.com/Supersynergy) fork of the excellent [`big-calendar`](https://github.com/lramos33/big-calendar) by [Leonardo Ramos](https://github.com/lramos33), continued and tuned for performance.

[Views](#-views) · [Features](#-features) · [Quick start](#-quick-start) · [Use in your project](#-use-it-in-your-project) · [Roadmap](#-roadmap) · [Credits](#-credits--thanks)

</div>

---

## Preview

![preview](public/preview_1.png)
![preview](public/preview_2.png)
![preview](public/preview_3.png)

---

## 🗓 Views

| View | What it shows |
|------|---------------|
| **Month** | Classic grid, up to 3 event badges per day + overflow count |
| **Week** | 7-day grid with hourly time slots and a live time indicator |
| **Day** | Single-day hourly breakdown with multi-day event row |
| **Year** | 12-month overview with per-day event dots |
| **Agenda** | Chronological list grouped by day |

## ✨ Features

- 📅 **Five calendar views** — month, week, day, year, agenda
- 🔄 **Drag & drop** — reschedule events across days and time slots with live visual feedback
- 🎨 **Event customization** — six colors, three badge variants (dot / colored / mixed), single & multi-day events
- 👥 **User management** — filter by user, view everyone at once, avatars
- ⚡ **Real-time** — live time indicator, current-event highlighting, dynamic positioning
- ⏰ **Time customization** — configurable working hours + adjustable visible-hours range
- 🌗 **Dark mode** + fully responsive design

## 🚀 What's new in SuperCalendar

This fork keeps the original feature set and focuses on **performance, maintainability, and modern tooling**.

- ⚡ **Memoized calendar context** — state changes no longer re-render every consumer
- ⚡ **`React.memo` on hot leaf cells** (day cell, event block, event badge, year cell) — far fewer renders on navigation and the per-minute time tick
- ⚡ **Single-pass, memoized event bucketing** — ISO dates are parsed only when the filtered set changes, not on every render
- 🧰 **Added scripts** — `typecheck`, `format`, `check` for a clean local gate
- 🗺 **A public [roadmap](docs/ROADMAP.md)** toward Next.js 16 / React 19 / Tailwind v4

See [`CHANGELOG.md`](CHANGELOG.md) for the full list.

## 🧱 Tech stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Dates**: date-fns
- **Drag & drop**: react-dnd
- **State**: React Context

## ⚡ Quick start

```bash
git clone https://github.com/Supersynergy/supercalendar.git
cd supercalendar

# install (pick one)
bun install      # recommended
npm install

# run
bun run dev      # or: npm run dev
```

Open `http://localhost:3000`.

## 🔌 Use it in your project

1. Copy the calendar into your app:

```
src/calendar/        # core calendar functionality
src/components/ui/    # UI components used by the calendar
src/hooks/            # required hooks (e.g. use-disclosure)
```

2. Wrap your page with the provider and render a view:

```tsx
import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { ClientContainer } from "@/calendar/components/client-container";

export default async function CalendarPage() {
  const events = await getEvents();
  const users = await getUsers();

  return (
    <CalendarProvider events={events} users={users}>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 p-4">
        <ClientContainer view="month" />
      </div>
    </CalendarProvider>
  );
}
```

Views: `<ClientContainer view="day | week | month | year | agenda" />`.

### Data shape

```tsx
interface IEvent {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  color: "blue" | "green" | "red" | "yellow" | "purple" | "orange";
  user: { id: string; name: string };
}

interface IUser {
  id: string;
  name: string;
  picturePath?: string; // optional avatar
}
```

The calendar state is available anywhere inside the provider via the `useCalendar()` hook.

## 🗺 Roadmap

The big rocks live in [`docs/ROADMAP.md`](docs/ROADMAP.md). Highlights:

- Migrate to **Next.js 16 + React 19** (async `cookies()`, Turbopack build)
- **Tailwind v4** (CSS-first config, Oxide engine)
- **ESLint → Biome**, add **Vitest + Playwright** tests
- Real data layer (TanStack Query + Server Actions) replacing the mock requests
- Recurring events, timezone support, iCal import/export

## 🤝 Contributing

Issues and PRs welcome. Run `bun run check` (typecheck + lint) before opening a PR.

## 🙏 Credits & thanks

SuperCalendar stands on the shoulders of [**big-calendar**](https://github.com/lramos33/big-calendar) by **[Leonardo Ramos](https://github.com/lramos33)** — a genuinely well-architected, beautiful calendar. All of the original design and core implementation are his work. Huge thanks. 🙌

If you like this, please ⭐ the [original project](https://github.com/lramos33/big-calendar) too — and you can [buy Leonardo a coffee](https://www.buymeacoffee.com/lramos33).

## 📄 License

MIT — see [`LICENSE`](LICENSE). Original copyright © 2025 Leonardo Ramos; fork modifications © 2026 SuperSynergy. See [`NOTICE`](NOTICE).

<div align="center">
Maintained by <a href="https://github.com/Supersynergy">SuperSynergy</a> · originally by <a href="https://github.com/lramos33">Leonardo Ramos</a>
</div>
