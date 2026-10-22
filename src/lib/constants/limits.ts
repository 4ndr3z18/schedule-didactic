/**
 * Límites de negocio que la base de datos no impone por sí sola.
 * Si cambian, se avisa en el PR y se actualiza `context/contracts.md`.
 */

/**
 * Máximo de asignaturas por alumno. Evita que el panel lateral y la grilla se
 * vuelvan inmanejables y limita el abuso del endpoint de creación.
 */
export const MAX_SUBJECTS_PER_STUDENT = 24;

/**
 * Claves de la paleta de asignaturas. Deben coincidir con
 * `src/lib/schedule/palette.ts` y con el check de `subjects.color` en la base.
 */
export const SUBJECT_COLOR_KEYS = [
  'clay',
  'teal',
  'amber',
  'olive',
  'green',
  'rose',
  'blue',
  'violet',
] as const;

export type SubjectColorKey = (typeof SUBJECT_COLOR_KEYS)[number];

/** Color por defecto para una asignatura nueva. */
export const DEFAULT_SUBJECT_COLOR: SubjectColorKey = 'clay';
