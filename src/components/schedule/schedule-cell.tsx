"use client";

import type { CSSProperties } from "react";
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";

import { cn } from "@/lib/utils";
import { SubjectCard } from "@/components/schedule/subject-card";
import { cellKey, dayLabel } from "@/lib/schedule/blocks";
import type { DayOfWeek, ScheduleBlock, Subject } from "@/lib/types/domain";

interface ScheduleCellProps {
  dayOfWeek: DayOfWeek;
  moduleIndex: number;
  block?: ScheduleBlock;
  subject?: Subject;
  /** Fila alterna para seguir la lectura horizontal. */
  isAltRow: boolean;
  /** Separador más grueso después del módulo 3 y del 6. */
  isRowBreak: boolean;
  /** Posición explícita dentro de la grilla CSS. */
  style?: CSSProperties;
}

export function ScheduleCell({
  dayOfWeek,
  moduleIndex,
  block,
  subject,
  isAltRow,
  isRowBreak,
  style,
}: ScheduleCellProps) {
  const id = cellKey(dayOfWeek, moduleIndex);
  const { setNodeRef, isOver } = useDroppable({ id, data: { dayOfWeek, moduleIndex } });
  const { active } = useDndContext();

  const isDragging = active != null;
  const isBlocked = block != null && block.id !== active?.id;
  const isFreeTarget = isDragging && !isBlocked;

  return (
    <div
      ref={setNodeRef}
      data-cell={id}
      style={style}
      className={cn(
        "relative border-r border-b p-[3px] transition-[background-color,box-shadow] duration-150 ease-out",
        isAltRow && "bg-muted/30",
        !isDragging && "hover:bg-accent/40",
        isFreeTarget && "bg-primary/[0.04]",
        isDragging && isBlocked && "bg-destructive/[0.06]",
        isOver && isBlocked && "ring-2 ring-destructive/50 ring-inset",
        isOver && !isBlocked && "bg-primary/10 ring-2 ring-primary/50 ring-inset",
        isRowBreak && "schedule-row-break",
      )}
    >
      {block && subject ? <DraggableBlock block={block} subject={subject} /> : null}
    </div>
  );
}

interface DraggableBlockProps {
  block: ScheduleBlock;
  subject: Subject;
}

function DraggableBlock({ block, subject }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: block.id,
    data: { block, subject },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      aria-label={`${subject.name} (${subject.code}), ${dayLabel(block.dayOfWeek)}, módulo ${block.moduleIndex}`}
      className={cn(
        "relative z-[1] h-full w-full cursor-grab touch-manipulation rounded-[3px] outline-none select-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200",
        isDragging && "cursor-grabbing opacity-25 saturate-50",
      )}
    >
      <SubjectCard subject={subject} />
    </div>
  );
}
