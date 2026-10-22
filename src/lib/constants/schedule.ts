/**
 * Constantes de la jornada académica para el backend.
 *
 * La fuente única es `src/lib/schedule/constants.ts`, que usa el frontend.
 * Este archivo reexporta esas constantes y añade los helpers de minutos que
 * necesitan los esquemas Zod y las Server Actions. Si cambia la jornada, se
 * cambia la fuente y el `check` de `schedule_blocks` en la base.
 *
 * ADR-004: 9 módulos de 80 minutos, lunes a sábado, con los recreos incluidos
 * en los horarios de cada módulo.
 */

import {
  DAYS as SCHEDULE_DAYS,
  MODULE_MINUTES,
  MODULES,
  TOTAL_MODULES,
} from '@/lib/schedule/constants';
import type { DayOfWeek } from '@/lib/types/domain';

export { MODULE_MINUTES, TOTAL_MODULES };
export type { DayOfWeek };

export const FIRST_MODULE_START = MODULES[0].start;
export const INCLUDE_SATURDAY = true;

export const DAYS: { value: DayOfWeek; label: string; shortLabel: string }[] =
  SCHEDULE_DAYS.map((day) => ({
    value: day.value,
    label: day.label,
    shortLabel: day.short,
  }));

/** Días que la grilla debe dibujar, según `INCLUDE_SATURDAY`. */
export const VISIBLE_DAYS = INCLUDE_SATURDAY
  ? DAYS
  : DAYS.filter((day) => day.value !== 6);

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function slotFor(moduleIndex: number) {
  const slot = MODULES.find((module) => module.index === moduleIndex);
  if (!slot) {
    throw new RangeError(
      `moduleIndex debe ser un entero entre 1 y ${TOTAL_MODULES}; recibido ${moduleIndex}.`,
    );
  }
  return slot;
}

/** Minutos desde la medianoche en que empieza un módulo (1..TOTAL_MODULES). */
export function getModuleStartMinutes(moduleIndex: number): number {
  return timeToMinutes(slotFor(moduleIndex).start);
}

/** Minutos desde la medianoche en que termina un módulo (1..TOTAL_MODULES). */
export function getModuleEndMinutes(moduleIndex: number): number {
  return timeToMinutes(slotFor(moduleIndex).end);
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
