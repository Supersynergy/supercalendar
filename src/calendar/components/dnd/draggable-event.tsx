"use client";

import { useDraggable } from "@dnd-kit/core";
import type { ReactNode } from "react";
import { useId } from "react";
import type { TEventDragData } from "@/calendar/components/dnd/dnd-provider";
import type { IEvent } from "@/calendar/interfaces";
import { cn } from "@/lib/utils";

interface DraggableEventProps {
  event: IEvent;
  children: ReactNode;
}

export function DraggableEvent({ event, children }: DraggableEventProps) {
  // The same event can render in multiple cells (multi-day badges), so derive a
  // unique draggable id per instance instead of using event.id.
  const id = useId();

  const data: TEventDragData = { event, overlay: children };
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={cn("touch-none", isDragging && "opacity-40")}>
      {children}
    </div>
  );
}
