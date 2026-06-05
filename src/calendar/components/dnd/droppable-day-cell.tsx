"use client";

import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";
import type { TDayCellDropData } from "@/calendar/components/dnd/dnd-provider";
import type { ICalendarCell } from "@/calendar/interfaces";
import { cn } from "@/lib/utils";

interface DroppableDayCellProps {
  cell: ICalendarCell;
  children: ReactNode;
}

export function DroppableDayCell({ cell, children }: DroppableDayCellProps) {
  const data: TDayCellDropData = { type: "day-cell", date: cell.date };
  const { setNodeRef, isOver } = useDroppable({ id: `day-${cell.date.toISOString()}`, data });

  return (
    <div ref={setNodeRef} className={cn("h-full", isOver && "bg-accent/50")}>
      {children}
    </div>
  );
}
