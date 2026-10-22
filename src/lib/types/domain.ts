import type { DayOfWeek } from '@/lib/constants/schedule';

/**
 * Tipos de dominio compartidos entre frontend y backend.
 *
 * Reflejan `context/contracts.md` y las tablas de `supabase/migrations`.
 * Cualquier cambio acá se avisa en el PR: rompe tipos en ambos lados.
 */

/** Nivel o semestre de una asignatura, de 1 a 6. */
export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export interface StudentProfile {
  id: string;
  fullName: string;
  career: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string;
  level: Level;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleBlock {
  id: string;
  userId: string;
  subjectId: string;
  /** 1 lunes … 6 sábado. */
  dayOfWeek: DayOfWeek;
  /** 1..TOTAL_MODULES (10). */
  moduleIndex: number;
  /** Módulos consecutivos que ocupa el bloque. */
  duration: number;
  createdAt: string;
  updatedAt: string;
}

/** Datos completos del horario de un alumno, en una sola respuesta. */
export interface Schedule {
  subjects: Subject[];
  blocks: ScheduleBlock[];
}
