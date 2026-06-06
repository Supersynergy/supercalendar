"use client";

import { CalendarRange, Columns, Grid2x2, Grid3x3, List, Plus } from "lucide-react";
import { AddEventDialog } from "@/calendar/components/dialogs/add-event-dialog";
import { DateNavigator } from "@/calendar/components/header/date-navigator";
import { TodayButton } from "@/calendar/components/header/today-button";
import { UserSelect } from "@/calendar/components/header/user-select";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import type { IEvent } from "@/calendar/interfaces";
import type { TCalendarView } from "@/calendar/types";
import { Button } from "@/components/ui/button";

interface IProps {
  view: TCalendarView;
  events: IEvent[];
  onViewChange: (view: TCalendarView) => void;
}

export function CalendarHeader({ view, events, onViewChange }: IProps) {
  const { t } = useCalendar();

  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <TodayButton />
        <DateNavigator view={view} events={events} />
      </div>

      <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
        <div className="flex w-full items-center gap-1.5">
          <div className="inline-flex first:rounded-r-none last:rounded-l-none [&:not(:first-child):not(:last-child)]:rounded-none">
            <Button
              type="button"
              onClick={() => onViewChange("day")}
              aria-label={t("view.day")}
              size="icon"
              variant={view === "day" ? "default" : "outline"}
              className="rounded-r-none [&_svg]:size-5"
            >
              <List strokeWidth={1.8} />
            </Button>

            <Button
              type="button"
              onClick={() => onViewChange("week")}
              aria-label={t("view.week")}
              size="icon"
              variant={view === "week" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
            >
              <Columns strokeWidth={1.8} />
            </Button>

            <Button
              type="button"
              onClick={() => onViewChange("month")}
              aria-label={t("view.month")}
              size="icon"
              variant={view === "month" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
            >
              <Grid2x2 strokeWidth={1.8} />
            </Button>

            <Button
              type="button"
              onClick={() => onViewChange("year")}
              aria-label={t("view.year")}
              size="icon"
              variant={view === "year" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
            >
              <Grid3x3 strokeWidth={1.8} />
            </Button>

            <Button
              type="button"
              onClick={() => onViewChange("agenda")}
              aria-label={t("view.agenda")}
              size="icon"
              variant={view === "agenda" ? "default" : "outline"}
              className="-ml-px rounded-l-none [&_svg]:size-5"
            >
              <CalendarRange strokeWidth={1.8} />
            </Button>
          </div>

          <UserSelect />
        </div>

        <AddEventDialog>
          <Button className="w-full sm:w-auto">
            <Plus />
            {t("addEvent")}
          </Button>
        </AddEventDialog>
      </div>
    </div>
  );
}
