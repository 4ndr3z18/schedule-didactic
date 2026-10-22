import type { Schedule, ScheduleBlock, Subject } from "@/lib/types/domain";
import { colorKeyForIndex } from "@/lib/schedule/palette";

/**
 * Datos de demostración. Se reemplazan por `getSchedule()` de
 * `src/server/actions/schedule.ts` en la Fase 5. Mientras existan,
 * la UI se puede construir y probar sin Supabase.
 */

const DEMO_USER = "demo-user";
const CREATED_AT = "2026-10-22T00:00:00.000Z";

const SUBJECTS: Omit<Subject, "userId" | "createdAt" | "color">[] = [
  { id: "ert2011", name: "Electrónica Analógica", code: "ERT2011", level: 3 },
  { id: "eao566", name: "Cálculo Avanzado", code: "EAO566", level: 5 },
  { id: "dti008", name: "Taller de Programación", code: "DTI008", level: 2 },
  { id: "ert3004", name: "Sistemas Digitales", code: "ERT3004", level: 4 },
  { id: "ert1002", name: "Circuitos Eléctricos", code: "ERT1002", level: 2 },
  { id: "eao544", name: "Álgebra Lineal", code: "EAO544", level: 1 },
];

const BLOCKS: Omit<ScheduleBlock, "userId">[] = [
  { id: "b1", subjectId: "ert2011", dayOfWeek: 1, moduleIndex: 1, duration: 1 },
  { id: "b2", subjectId: "ert2011", dayOfWeek: 1, moduleIndex: 2, duration: 1 },
  { id: "b3", subjectId: "eao566", dayOfWeek: 1, moduleIndex: 3, duration: 1 },
  { id: "b4", subjectId: "ert3004", dayOfWeek: 1, moduleIndex: 5, duration: 1 },
  { id: "b5", subjectId: "ert3004", dayOfWeek: 1, moduleIndex: 6, duration: 1 },
  { id: "b6", subjectId: "dti008", dayOfWeek: 2, moduleIndex: 2, duration: 1 },
  { id: "b7", subjectId: "eao544", dayOfWeek: 2, moduleIndex: 6, duration: 1 },
  { id: "b8", subjectId: "ert1002", dayOfWeek: 3, moduleIndex: 3, duration: 1 },
  { id: "b9", subjectId: "ert1002", dayOfWeek: 3, moduleIndex: 4, duration: 2 },
  { id: "b10", subjectId: "dti008", dayOfWeek: 3, moduleIndex: 6, duration: 1 },
  { id: "b11", subjectId: "eao566", dayOfWeek: 5, moduleIndex: 2, duration: 1 },
  { id: "b12", subjectId: "eao566", dayOfWeek: 5, moduleIndex: 3, duration: 1 },
];

export function getMockSchedule(): Schedule {
  const subjects: Subject[] = SUBJECTS.map((subject, index) => ({
    ...subject,
    userId: DEMO_USER,
    color: colorKeyForIndex(index),
    createdAt: CREATED_AT,
  }));

  const blocks: ScheduleBlock[] = BLOCKS.map((block) => ({
    ...block,
    userId: DEMO_USER,
  }));

  return { subjects, blocks };
}
