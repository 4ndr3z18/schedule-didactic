import { BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSubjectColor } from "@/lib/schedule/palette";
import type { Subject } from "@/lib/types/domain";

interface SubjectsPanelProps {
  subjects: Subject[];
  className?: string;
}

export function SubjectsPanel({ subjects, className }: SubjectsPanelProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Asignaturas</h2>
        <Badge variant="secondary">{subjects.length}</Badge>
      </div>

      {subjects.length === 0 ? (
        <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
          Aún no tienes asignaturas.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {subjects.map((subject) => {
            const color = getSubjectColor(subject.color);

            return (
              <li
                key={subject.id}
                className="flex items-center gap-2.5 rounded-md border bg-card px-2.5 py-2"
              >
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color.background }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{subject.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {subject.code} · Nivel {subject.level}
                  </p>
                </div>
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
