/**
 * Límites de negocio que la base de datos no impone por sí sola.
 * Si cambian, se avisa en el PR y se actualiza `context/contracts.md`.
 */

/**
 * Máximo de asignaturas por alumno. Evita que el panel lateral y la grilla se
 * vuelvan inmanejables y limita el abuso del endpoint de creación.
 */
export const MAX_SUBJECTS_PER_STUDENT = 24;

/** Paleta por defecto para una asignatura nueva. */
export const DEFAULT_SUBJECT_COLOR = '#64748b';
