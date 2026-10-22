import type { DayOfWeek } from "@/lib/types/domain";

export interface ModuleSlot {
  index: number;
  start: string;
  end: string;
}

export const DAYS: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 1, label: "Lunes", short: "Lun" },
  { value: 2, label: "Martes", short: "Mar" },
  { value: 3, label: "Miércoles", short: "Mié" },
  { value: 4, label: "Jueves", short: "Jue" },
  { value: 5, label: "Viernes", short: "Vie" },
  { value: 6, label: "Sábado", short: "Sáb" },
];

/** Jornada USACH: 9 módulos de 80 minutos, lunes a sábado. Ver ADR-004. */
export const MODULES: ModuleSlot[] = [
  { index: 1, start: "08:15", end: "09:35" },
  { index: 2, start: "09:50", end: "11:10" },
  { index: 3, start: "11:25", end: "12:45" },
  { index: 4, start: "13:45", end: "15:05" },
  { index: 5, start: "15:20", end: "16:40" },
  { index: 6, start: "16:55", end: "18:15" },
  { index: 7, start: "18:45", end: "20:05" },
  { index: 8, start: "20:05", end: "21:25" },
  { index: 9, start: "21:25", end: "22:45" },
];

export const TOTAL_MODULES = MODULES.length;
export const MODULE_MINUTES = 80;

/** Después de estos módulos la grilla dibuja un separador más grueso. */
export const GROUP_BREAK_AFTER = new Set([3, 6]);

export function moduleRange(slot: ModuleSlot): string {
  return `${slot.start} – ${slot.end}`;
}

export function isModuleInRange(index: number): boolean {
  return index >= 1 && index <= TOTAL_MODULES;
}

/** Valida que un bloque quepa en la jornada y no se salga por abajo. */
export function blockFits(moduleIndex: number, duration: number): boolean {
  return isModuleInRange(moduleIndex) && duration >= 1 && moduleIndex + duration - 1 <= TOTAL_MODULES;
}
