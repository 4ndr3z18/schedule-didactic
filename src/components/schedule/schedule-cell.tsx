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
      style={{
        ...style,
        backgroundColor: isAltRow
          ? "color-mix(in oklch, var(--muted) 40%, var(--background))"
          : "var(--background)",
      }}
      className={cn(
        "group/cell relative p-[3px] transition-shadow duration-150 ease-out",
        isRowBreak && "schedule-row-break",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-colors duration-150 ease-out",
          !isDragging && "group-hover/cell:bg-accent/40",
          isFreeTarget && "bg-primary/[0.04]",
          isDragging && isBlocked && "bg-destructive/[0.06]",
          isOver && isBlocked && "bg-destructive/10 ring-destructive/50 ring-2 ring-inset",
          isOver && !isBlocked && "bg-primary/10 ring-primary/50 ring-2 ring-inset",
        )}
      />
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
      data-block-id={block.id}
      {...listeners}
      {...attributes}
      aria-label={`${subject.name} (${subject.code}), ${dayLabel(block.dayOfWeek)}, módulo ${block.moduleIndex}`}
      className={cn(
        "relative z-[1] h-full w-full cursor-grab touch-manipulation rounded-[3px] outline-none select-none",
        "transition-[transform,filter,box-shadow] duration-150 ease-out motion-reduce:transition-none",
        "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-1",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200",
        isDragging
          ? "scale-[0.9] cursor-grabbing brightness-95 saturate-[0.85]"
          : "active:scale-[0.97]",
      )}
    >
      <SubjectCard subject={subject} />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-[2] rounded-md shadow-[inset_0_2px_10px_rgba(0,0,0,0.35)] transition-opacity duration-150",
          isDragging ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
