"use client";

import { useState } from "react";
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { differenceInMilliseconds, parseISO } from "date-fns";

import { useUpdateEvent } from "@/calendar/hooks/use-update-event";

import type { ReactNode } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { IEvent } from "@/calendar/interfaces";

export type TDayCellDropData = { type: "day-cell"; date: Date };
export type TTimeBlockDropData = { type: "time-block"; date: Date; hour: number; minute: number };
export type TDropData = TDayCellDropData | TTimeBlockDropData;
export type TEventDragData = { event: IEvent; overlay: ReactNode };

interface DndProviderWrapperProps {
  children: ReactNode;
}

export function DndProviderWrapper({ children }: DndProviderWrapperProps) {
  const { updateEvent } = useUpdateEvent();
  const [overlay, setOverlay] = useState<ReactNode | null>(null);

  // Require a small drag distance so plain clicks still open the event dialog.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

  function handleDragStart(e: DragStartEvent) {
    const data = e.active.data.current as TEventDragData | undefined;
    setOverlay(data?.overlay ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    setOverlay(null);

    const overData = e.over?.data.current as TDropData | undefined;
    const activeData = e.active.data.current as TEventDragData | undefined;
    if (!overData || !activeData?.event) return;

    const droppedEvent = activeData.event;
    const start = parseISO(droppedEvent.startDate);
    const end = parseISO(droppedEvent.endDate);
    const durationMs = differenceInMilliseconds(end, start);

    const newStart = new Date(overData.date);
    if (overData.type === "day-cell") {
      newStart.setHours(start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds());
    } else {
      newStart.setHours(overData.hour, overData.minute, 0, 0);
    }
    const newEnd = new Date(newStart.getTime() + durationMs);

    updateEvent({ ...droppedEvent, startDate: newStart.toISOString(), endDate: newEnd.toISOString() });
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setOverlay(null)}>
      {children}
      <DragOverlay dropAnimation={null}>{overlay}</DragOverlay>
    </DndContext>
  );
}
