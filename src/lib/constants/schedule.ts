/**
 * Constantes de la jornada académica.
 *
 * Son la única fuente de verdad para la grilla del frontend, los esquemas Zod y
 * los límites de la base de datos (ver `supabase/migrations`). Si cambian acá,
 * cambian también el `check` de `schedule_blocks` y `context/contracts.md`.
 *
 * Decisión: 10 módulos consecutivos de 90 minutos desde las 08:15, lunes a
 * sábado, sin recreos modelados. El último módulo va de 21:45 a 23:15.
 */

export const TOTAL_MODULES = 10;
export const MODULE_MINUTES = 90;
export const FIRST_MODULE_START = '08:15';
export const INCLUDE_SATURDAY = true;

export const DAYS = [
  { value: 1, label: 'Lunes', shortLabel: 'Lun' },
  { value: 2, label: 'Martes', shortLabel: 'Mar' },
  { value: 3, label: 'Miércoles', shortLabel: 'Mié' },
  { value: 4, label: 'Jueves', shortLabel: 'Jue' },
  { value: 5, label: 'Viernes', shortLabel: 'Vie' },
  { value: 6, label: 'Sábado', shortLabel: 'Sáb' },
] as const;

export type DayOfWeek = (typeof DAYS)[number]['value'];

/** Días que la grilla debe dibujar, según `INCLUDE_SATURDAY`. */
export const VISIBLE_DAYS = INCLUDE_SATURDAY
  ? DAYS
  : DAYS.filter((day) => day.value !== 6);

const FIRST_MODULE_START_MINUTES = (() => {
  const [hours, minutes] = FIRST_MODULE_START.split(':').map(Number);
  return hours * 60 + minutes;
})();

function assertModuleIndex(moduleIndex: number): void {
  if (
    !Number.isInteger(moduleIndex) ||
    moduleIndex < 1 ||
    moduleIndex > TOTAL_MODULES
  ) {
    throw new RangeError(
      `moduleIndex debe ser un entero entre 1 y ${TOTAL_MODULES}; recibido ${moduleIndex}.`,
    );
  }
}

/** Minutos desde la medianoche en que empieza un módulo (1..TOTAL_MODULES). */
export function getModuleStartMinutes(moduleIndex: number): number {
  assertModuleIndex(moduleIndex);
  return FIRST_MODULE_START_MINUTES + (moduleIndex - 1) * MODULE_MINUTES;
}

/** Minutos desde la medianoche en que termina un módulo (1..TOTAL_MODULES). */
export function getModuleEndMinutes(moduleIndex: number): number {
  return getModuleStartMinutes(moduleIndex) + MODULE_MINUTES;
}

/** Formatea minutos desde la medianoche como `HH:mm`. */
export function formatMinutes(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Rango horario de un módulo, listo para el encabezado de la grilla. */
export function getModuleTimeRange(moduleIndex: number): {
  start: string;
  end: string;
} {
  return {
    start: formatMinutes(getModuleStartMinutes(moduleIndex)),
    end: formatMinutes(getModuleEndMinutes(moduleIndex)),
  };
}
