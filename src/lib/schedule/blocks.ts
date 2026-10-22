import { DAYS, TOTAL_MODULES } from "@/lib/schedule/constants";
import type { DayOfWeek, ScheduleBlock } from "@/lib/types/domain";

/** Clave estable de una casilla de la grilla. */
export function cellKey(dayOfWeek: DayOfWeek, moduleIndex: number): string {
  return `${dayOfWeek}:${moduleIndex}`;
}

/**
 * Expande los bloques de varios módulos en un bloque por módulo.
 * La UI muestra una tarjeta por casilla; el modelo del backend no cambia.
 */
export function normalizeBlocks(blocks: ScheduleBlock[]): ScheduleBlock[] {
  return blocks.flatMap((block) => {
    const duration = Math.max(1, Math.min(block.duration, TOTAL_MODULES));

    return Array.from({ length: duration }, (_, offset) => ({
      ...block,
      id: offset === 0 ? block.id : `${block.id}~${offset}`,
      moduleIndex: block.moduleIndex + offset,
      duration: 1,
    })).filter((item) => item.moduleIndex >= 1 && item.moduleIndex <= TOTAL_MODULES);
  });
}

/** Índice de bloques por casilla, para dibujar la grilla en O(1). */
export function blocksByCell(blocks: ScheduleBlock[]): Map<string, ScheduleBlock> {
  return new Map(blocks.map((block) => [cellKey(block.dayOfWeek, block.moduleIndex), block]));
}

export function dayLabel(dayOfWeek: DayOfWeek): string {
  return DAYS.find((day) => day.value === dayOfWeek)?.label ?? "";
}
