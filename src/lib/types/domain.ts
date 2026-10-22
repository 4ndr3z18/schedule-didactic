/**
 * Tipos de dominio compartidos entre frontend y backend.
 * Deben coincidir con `docs/contracts.md` y con la base de datos.
 * Cambiarlos requiere aviso en el PR: los usa Andrés en las Server Actions.
 */

export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6;

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string;
  level: number;
  /** Clave de color de la paleta: clay, teal, amber, olive, green, rose, blue, violet. */
  color: string;
  createdAt: string;
}

export interface ScheduleBlock {
  id: string;
  userId: string;
  subjectId: string;
  dayOfWeek: DayOfWeek;
  /** 1 a 9, según `MODULES`. */
  moduleIndex: number;
  /** Cantidad de módulos consecutivos que ocupa el bloque. Mínimo 1. */
  duration: number;
}

export interface Schedule {
  subjects: Subject[];
  blocks: ScheduleBlock[];
}

/** Formato único de retorno de las Server Actions. */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string[]> };
