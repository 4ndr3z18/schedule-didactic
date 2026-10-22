import { BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSubjectColor } from "@/lib/schedule/palette";
import type { Subject } from "@/lib/types/domain";

interface SubjectsPanelProps {
  subjects: Subject[];
  className?: string;
  /** La hoja móvil ya dibuja su propio título. */
  showHeading?: boolean;
}

export function SubjectsPanel({ subjects, className, showHeading = true }: SubjectsPanelProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {showHeading ? (
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Asignaturas</h2>
          <Badge variant="secondary">{subjects.length}</Badge>
        </div>
      ) : null}

      {subjects.length === 0 ? (
        <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
          Aún no tienes asignaturas.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {subjects.map((subject, index) => {
            const color = getSubjectColor(subject.color);

            return (
              <li
                key={subject.id}
                style={{ animationDelay: `${Math.min(index, 8) * 30}ms`, animationFillMode: "both" }}
                className={cn(
                  "flex items-center gap-2.5 rounded-md border bg-card px-2.5 py-2",
                  "transition-colors duration-150 hover:bg-accent/50",
                  "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-1 motion-safe:duration-300",
                )}
              >
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color.background }}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-xs font-medium">{subject.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{subject.code}</p>
                </div>
                <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                  Nivel {subject.level}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <Button variant="outline" size="sm" disabled className="w-full">
        <BookOpen aria-hidden />
        Agregar asignatura
      </Button>
      <p className="text-center text-[10px] text-muted-foreground">
        Disponible al conectar Supabase.
      </p>
    </div>
  );
}
