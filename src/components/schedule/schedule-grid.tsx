import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { SubjectCard } from "@/components/schedule/subject-card";
import { DAYS, GROUP_BREAK_AFTER, MODULES, blockFits, moduleRange } from "@/lib/schedule/constants";
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

  return (
    <div className="overflow-x-auto rounded-lg border bg-background">
      <div
        role="group"
        aria-label="Horario semanal"
        className="grid min-w-[62rem]"
        style={{
          gridTemplateColumns: "5rem repeat(6, minmax(9rem, 1fr))",
          gridTemplateRows: "2.75rem repeat(9, 3.5rem)",
        }}
      >
        <div
          style={{ gridRow: HEADER_ROW, gridColumn: 1 }}
          className="sticky top-0 left-0 z-40 flex items-center justify-center border-r border-b bg-muted/50"
        >
          {cornerSlot}
        </div>

        {DAYS.map((day, dayIndex) => (
          <div
            key={day.value}
            style={{ gridRow: HEADER_ROW, gridColumn: dayIndex + DAY_COLUMN_OFFSET }}
            className="sticky top-0 z-30 flex items-center justify-center border-r border-b bg-background/95 text-[11px] font-semibold tracking-wide uppercase backdrop-blur"
          >
            <span className="hidden sm:inline">{day.label}</span>
            <span className="sm:hidden">{day.short}</span>
          </div>
        ))}

        {MODULES.map((slot) => {
          const isGroupBreak = GROUP_BREAK_AFTER.has(slot.index);

          return (
            <Fragment key={slot.index}>
              <div
                style={{ gridRow: slot.index + 1, gridColumn: 1 }}
                className={cn(
                  "sticky left-0 z-20 flex items-center justify-center border-r border-b bg-background text-[11px] tabular-nums text-muted-foreground",
                  isGroupBreak && "border-b-2 border-b-foreground/25",
                )}
              >
                {moduleRange(slot)}
              </div>

              {DAYS.map((day, dayIndex) => (
                <div
                  key={day.value}
                  style={{ gridRow: slot.index + 1, gridColumn: dayIndex + DAY_COLUMN_OFFSET }}
                  className={cn(
                    "border-r border-b bg-card/40",
                    isGroupBreak && "border-b-2 border-b-foreground/25",
                  )}
                />
              ))}
            </Fragment>
          );
        })}

        {blocks.map((block) => {
          const subject = subjectsById.get(block.subjectId);
          const dayIndex = DAYS.findIndex((day) => day.value === block.dayOfWeek);

          if (!subject || dayIndex === -1 || !blockFits(block.moduleIndex, block.duration)) {
            return null;
          }

          return (
            <div
              key={block.id}
              className="z-10 p-0.5"
              style={{
                gridRow: `${block.moduleIndex + 1} / span ${block.duration}`,
                gridColumn: dayIndex + DAY_COLUMN_OFFSET,
              }}
            >
              <SubjectCard subject={subject} duration={block.duration} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
