"use client";

import { useDroppable } from "@dnd-kit/core";

import { cn } from "@/lib/utils";

import type { ReactNode } from "react";
import type { TTimeBlockDropData } from "@/calendar/components/dnd/dnd-provider";

interface DroppableTimeBlockProps {
  date: Date;
  hour: number;
  minute: number;
  children: ReactNode;
}

export function DroppableTimeBlock({ date, hour, minute, children }: DroppableTimeBlockProps) {
  const data: TTimeBlockDropData = { type: "time-block", date, hour, minute };
  const { setNodeRef, isOver } = useDroppable({ id: `time-${date.toISOString()}-${hour}-${minute}`, data });

  return (
    <div ref={setNodeRef} className={cn("h-[24px]", isOver && "bg-accent/50")}>
      {children}
    </div>
  );
}
