import { Fragment, type ReactNode } from "react";

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
}

const DAY_COLUMN_OFFSET = 2; // la columna 1 es la de horarios
const HEADER_ROW = 1;

export function ScheduleGrid({ subjects, blocks, cornerSlot }: ScheduleGridProps) {
  const subjectsById = new Map(subjects.map((subject) => [subject.id, subject]));
  const cellBlocks = blocksByCell(blocks);

  return (
    <div className="overflow-x-auto rounded-lg border bg-background">
      <div
        role="group"
        aria-label={`Horario semanal: ${dayLabel(1)} a ${dayLabel(6)}`}
        className="grid min-w-[49.25rem]"
        style={{
          gridTemplateColumns: "4.25rem repeat(6, minmax(7.5rem, 1fr))",
          gridTemplateRows: "2.375rem repeat(9, 3rem)",
        }}
      >
        <div
          style={{ gridRow: HEADER_ROW, gridColumn: 1 }}
          className="sticky top-0 left-0 z-40 flex items-center justify-center overflow-hidden border-r border-b bg-muted/50"
        >
          {cornerSlot}
        </div>

        {DAYS.map((day, dayIndex) => (
          <div
            key={day.value}
            style={{ gridRow: HEADER_ROW, gridColumn: dayIndex + DAY_COLUMN_OFFSET }}
            className="sticky top-0 z-30 flex items-center justify-center overflow-hidden border-r border-b bg-background/95 px-1 text-[10px] font-semibold tracking-wide uppercase backdrop-blur"
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
                  "sticky left-0 z-20 flex flex-col items-center justify-center gap-0.5 overflow-hidden border-r border-b bg-background px-1 leading-none",
                  isRowBreak && "schedule-row-break",
                )}
              >
                <span className="text-[10px] font-medium tabular-nums text-foreground/80">
                  {slot.start}
                </span>
                <span className="text-[9px] tabular-nums text-muted-foreground">{slot.end}</span>
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
  );
}
