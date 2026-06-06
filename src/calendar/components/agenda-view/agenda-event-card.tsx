"use client";

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { format, parseISO } from "date-fns";
import { Check, Clock, Copy, Link2, MoreVertical, Pencil, Text, Trash2, User } from "lucide-react";
import { useState } from "react";

import { EventDetailsDialog } from "@/calendar/components/dialogs/event-details-dialog";
import { Linkify } from "@/calendar/components/linkify";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import type { IEvent } from "@/calendar/interfaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const agendaEventCardVariants = cva("flex select-text items-start justify-between gap-3 rounded-md border p-3 text-sm", {
  variants: {
    color: {
      // Colored variants
      blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 [&_.event-dot]:fill-blue-600",
      green: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300 [&_.event-dot]:fill-green-600",
      red: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 [&_.event-dot]:fill-red-600",
      yellow: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 [&_.event-dot]:fill-yellow-600",
      purple: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 [&_.event-dot]:fill-purple-600",
      orange: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300 [&_.event-dot]:fill-orange-600",
      gray: "border-neutral-200 bg-neutral-50 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 [&_.event-dot]:fill-neutral-600",

      // Dot variants
      "blue-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-blue-600",
      "green-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-green-600",
      "red-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-red-600",
      "orange-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-orange-600",
      "purple-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-purple-600",
      "yellow-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-yellow-600",
      "gray-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-neutral-600",
    },
  },
  defaultVariants: {
    color: "blue-dot",
  },
});

const actionItemClasses =
  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-foreground hover:bg-accent [&_svg]:size-4 [&_svg]:shrink-0";

interface IProps {
  event: IEvent;
  eventCurrentDay?: number;
  eventTotalDays?: number;
  selected?: boolean;
  onToggleSelect?: (id: number) => void;
  onDuplicate?: (id: number) => void;
  onDelete?: (id: number) => void;
  onUpdateTitle?: (id: number, title: string) => void;
}

export function AgendaEventCard({ event, eventCurrentDay, eventTotalDays, selected, onToggleSelect, onDuplicate, onDelete, onUpdateTitle }: IProps) {
  const { badgeVariant } = useCalendar();

  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(event.title);
  const [copied, setCopied] = useState(false);

  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);

  const color = (badgeVariant === "dot" ? `${event.color}-dot` : event.color) as VariantProps<typeof agendaEventCardVariants>["color"];

  const commitTitle = () => {
    const next = draftTitle.trim();
    if (next && next !== event.title) onUpdateTitle?.(event.id, next);
    else setDraftTitle(event.title);
    setEditing(false);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/agenda-view?event=${event.id}`;

    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch {
      ok = false; // clipboard API can reject without focus / permission — fall through
    }

    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        ta.remove();
      } catch {
        ok = false;
      }
    }

    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div data-event-id={event.id} className={cn(agendaEventCardVariants({ color }), "transition-shadow", selected && "ring-2 ring-ring")}>
      {onToggleSelect && (
        <button
          type="button"
          aria-label={selected ? "Deselect event" : "Select event"}
          aria-pressed={selected}
          onClick={() => onToggleSelect(event.id)}
          className={cn(
            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-current/40",
            selected && "bg-primary text-primary-foreground"
          )}
        >
          {selected && <Check className="size-3" />}
        </button>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-1.5">
          {["mixed", "dot"].includes(badgeVariant) && (
            <svg width="8" height="8" viewBox="0 0 8 8" className="event-dot shrink-0">
              <circle cx="4" cy="4" r="4" />
            </svg>
          )}

          {editing ? (
            <Input
              autoFocus
              value={draftTitle}
              onChange={e => setDraftTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={e => {
                if (e.key === "Enter") commitTitle();
                if (e.key === "Escape") {
                  setDraftTitle(event.title);
                  setEditing(false);
                }
              }}
              className="h-6 py-0 text-sm"
            />
          ) : (
            <p className="font-medium">
              {eventCurrentDay && eventTotalDays && (
                <span className="mr-1 text-xs">
                  Day {eventCurrentDay} of {eventTotalDays} •{" "}
                </span>
              )}
              <EventDetailsDialog event={event}>
                <button type="button" className="text-left font-medium hover:underline" title="Details öffnen">
                  {event.title}
                </button>
              </EventDetailsDialog>
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <User className="size-3 shrink-0" />
          <p className="text-xs text-foreground">{event.user.name}</p>
        </div>

        <div className="flex items-center gap-1">
          <Clock className="size-3 shrink-0" />
          <p className="text-xs text-foreground">
            {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
          </p>
        </div>

        <div className="flex items-start gap-1">
          <Text className="mt-0.5 size-3 shrink-0" />
          <p className="text-xs text-foreground">
            <Linkify>{event.description}</Linkify>
          </p>
        </div>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" size="icon" variant="ghost" aria-label="Event actions" className="size-7 shrink-0">
            <MoreVertical className="size-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-48 p-1">
          <button
            type="button"
            className={actionItemClasses}
            onClick={() => {
              setDraftTitle(event.title);
              setEditing(true);
            }}
          >
            <Pencil />
            Umbenennen
          </button>

          <button type="button" className={actionItemClasses} onClick={() => onDuplicate?.(event.id)}>
            <Copy />
            Duplizieren
          </button>

          <button type="button" className={cn(actionItemClasses, copied && "text-green-600")} onClick={copyLink}>
            {copied ? <Check /> : <Link2 />}
            {copied ? "Kopiert ✓" : "Link kopieren"}
          </button>

          <button type="button" className={cn(actionItemClasses, "text-red-600 hover:bg-red-50 dark:hover:bg-red-950")} onClick={() => onDelete?.(event.id)}>
            <Trash2 />
            Löschen
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
