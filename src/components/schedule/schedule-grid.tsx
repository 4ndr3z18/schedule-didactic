"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { ScheduleCell } from "@/components/schedule/schedule-cell";
import { DAYS, GROUP_BREAK_AFTER, MODULES } from "@/lib/schedule/constants";
import { blocksByCell, cellKey, dayLabel } from "@/lib/schedule/blocks";
import type { ScheduleBlock, Subject } from "@/lib/types/domain";

interface ScheduleGridProps {
  subjects: Subject[];
  blocks: ScheduleBlock[];
  /** Se dibuja en la esquina superior izquierda, como en el formato USACH. */
  cornerSlot?: ReactNode;
  /** Desactiva el imán de desplazamiento mientras se arrastra una tarjeta. */
  isDragging?: boolean;
}

const DAY_COLUMN_OFFSET = 2; // la columna 1 es la de horarios
const HEADER_ROW = 1;

export function ScheduleGrid({
  subjects,
  blocks,
  cornerSlot,
  isDragging = false,
}: ScheduleGridProps) {
  const subjectsById = new Map(subjects.map((subject) => [subject.id, subject]));
  const cellBlocks = blocksByCell(blocks);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    const update = () => {
      setCanScrollRight(node.scrollLeft + node.clientWidth < node.scrollWidth - 2);
    };

    update();
    node.addEventListener("scroll", update, { passive: true });

    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => {
      node.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        data-scroller
        className={cn(
          "bg-background overflow-x-auto rounded-lg border",
          !isDragging && "max-sm:snap-x max-sm:snap-mandatory max-sm:scroll-pl-[4.25rem]",
        )}
      >
        <div
          role="group"
          aria-label={`Horario semanal: ${dayLabel(1)} a ${dayLabel(6)}`}
          className="bg-border grid min-w-[49.625rem] gap-px"
          style={{
            gridTemplateColumns: "4.25rem repeat(6, minmax(7.5rem, 1fr))",
            gridTemplateRows: "2.375rem repeat(9, minmax(var(--schedule-row-h), auto))",
          }}
        >
          <div
            style={{ gridRow: HEADER_ROW, gridColumn: 1 }}
            className="bg-muted sticky top-0 left-0 z-40 flex items-center justify-center overflow-hidden shadow-[1px_0_0_var(--border),0_1px_0_var(--border)]"
          >
            {cornerSlot}
          </div>

          {DAYS.map((day, dayIndex) => (
            <div
              key={day.value}
              style={{ gridRow: HEADER_ROW, gridColumn: dayIndex + DAY_COLUMN_OFFSET }}
              className="bg-background sticky top-0 z-30 flex snap-start items-center justify-center overflow-hidden px-1 text-[10px] font-semibold tracking-wide uppercase shadow-[0_1px_0_var(--border)]"
            >
              <span className="hidden truncate sm:inline">{day.label}</span>
              <span className="sm:hidden">{day.short}</span>
            </div>
          ))}

          {MODULES.map((slot) => {
            const isRowBreak = GROUP_BREAK_AFTER.has(slot.index);

            return (
              <Fragment key={slot.index}>
                <div
                  style={{ gridRow: slot.index + 1, gridColumn: 1 }}
                  className={cn(
                    "bg-background sticky left-0 z-20 flex flex-col items-center justify-center gap-0.5 overflow-hidden px-1 leading-none shadow-[1px_0_0_var(--border),6px_0_8px_-6px_rgba(0,0,0,0.18)]",
                    isRowBreak && "schedule-row-break",
                  )}
                >
                  <span className="text-foreground/80 text-[10px] font-medium tabular-nums">
                    {slot.start}
                  </span>
                  <span className="text-muted-foreground text-[9px] tabular-nums">{slot.end}</span>
                </div>

                {DAYS.map((day, dayIndex) => {
                  const block = cellBlocks.get(cellKey(day.value, slot.index));

                  return (
                    <ScheduleCell
                      key={day.value}
                      dayOfWeek={day.value}
                      moduleIndex={slot.index}
                      block={block}
                      subject={block ? subjectsById.get(block.subjectId) : undefined}
                      isAltRow={slot.index % 2 === 0}
                      isRowBreak={isRowBreak}
                      style={{
                        gridRow: slot.index + 1,
                        gridColumn: dayIndex + DAY_COLUMN_OFFSET,
                      }}
                    />
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>

      <div
        aria-hidden
        className={cn(
          "from-background pointer-events-none absolute inset-y-px right-px z-50 w-6 rounded-r-lg bg-linear-to-l to-transparent transition-opacity duration-200 sm:hidden",
          canScrollRight ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
