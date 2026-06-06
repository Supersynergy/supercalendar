"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Text, Trash2, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EditEventDialog } from "@/calendar/components/dialogs/edit-event-dialog";
import { Linkify } from "@/calendar/components/linkify";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useDeleteEvent } from "@/calendar/hooks/use-delete-event";
import type { IEvent } from "@/calendar/interfaces";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface IProps {
  event: IEvent;
  children: React.ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const { events, use24HourFormat, t } = useCalendar();
  const { deleteEvent } = useDeleteEvent();

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(event);

  // Keep in sync if the triggering event changes underneath us.
  useEffect(() => setCurrentEvent(event), [event]);

  // All events ordered by start — drives ↑/↓ navigation inside the dialog.
  const ordered = useMemo(() => [...events].sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()), [events]);

  const goRelative = (delta: number) => {
    if (ordered.length === 0) return;
    const idx = ordered.findIndex(e => e.id === currentEvent.id);
    const base = idx === -1 ? 0 : idx;
    const next = (base + delta + ordered.length) % ordered.length;
    setCurrentEvent(ordered[next]);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setCurrentEvent(event);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      goRelative(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      goRelative(-1);
    } else if (e.key === "e" || e.key === "E") {
      e.preventDefault();
      setOpen(false);
      setEditOpen(true);
    }
  };

  const handleDelete = () => {
    setOpen(false);
    deleteEvent(currentEvent.id);
  };

  const timeFormat = use24HourFormat ? "MMM d, yyyy HH:mm" : "MMM d, yyyy h:mm a";
  const startDate = parseISO(currentEvent.startDate);
  const endDate = parseISO(currentEvent.endDate);

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent onKeyDown={onKeyDown}>
          <DialogHeader>
            <DialogTitle>{currentEvent.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <User className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">{t("event.responsible")}</p>
                <p className="text-sm text-muted-foreground">{currentEvent.user.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">{t("event.startDate")}</p>
                <p className="text-sm text-muted-foreground">{format(startDate, timeFormat)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">{t("event.endDate")}</p>
                <p className="text-sm text-muted-foreground">{format(endDate, timeFormat)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Text className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">{t("event.description")}</p>
                <p className="text-sm text-muted-foreground">
                  <Linkify>{currentEvent.description}</Linkify>
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:items-center sm:justify-between">
            <p className="hidden text-xs text-muted-foreground sm:block">
              <kbd className="rounded border px-1 font-sans">↑</kbd> <kbd className="rounded border px-1 font-sans">↓</kbd> {t("event.hintNavigate")} ·{" "}
              <kbd className="rounded border px-1 font-sans">E</kbd> {t("event.hintEdit")}
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete}>
                <Trash2 className="size-4" />
                {t("event.delete")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEditOpen(true);
                }}
              >
                {t("event.edit")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Controlled, keyed per event so the form resets when navigating. */}
      <EditEventDialog key={currentEvent.id} event={currentEvent} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
