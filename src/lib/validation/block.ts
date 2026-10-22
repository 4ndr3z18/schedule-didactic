import { z } from 'zod';

import { TOTAL_MODULES, type DayOfWeek } from '@/lib/constants/schedule';

/** Esquemas de bloques del horario. Se validan en cliente y servidor. */

export const blockIdSchema = z.string().uuid('Identificador inválido.');

export const dayOfWeekSchema = z.coerce
  .number()
  .min(1, 'El día debe estar entre 1 (lunes) y 6 (sábado).')
  .max(6, 'El día debe estar entre 1 (lunes) y 6 (sábado).')
  .refine(Number.isInteger, 'El día debe ser un número entero.')
  .transform((value) => value as DayOfWeek);

export const moduleIndexSchema = z.coerce
  .number()
  .min(1, 'El módulo debe estar entre 1 y 10.')
  .max(TOTAL_MODULES, `El módulo debe estar entre 1 y ${TOTAL_MODULES}.`)
  .refine(Number.isInteger, 'El módulo debe ser un número entero.');

export const durationSchema = z.coerce
  .number()
  .min(1, 'La duración debe ser de al menos 1 módulo.')
  .max(TOTAL_MODULES, `La duración no puede superar ${TOTAL_MODULES} módulos.`)
  .refine(Number.isInteger, 'La duración debe ser un número entero.');

function endsInsideDay(value: {
  moduleIndex: number;
  duration: number;
}): boolean {
  return value.moduleIndex + value.duration - 1 <= TOTAL_MODULES;
}

export const placeBlockSchema = z
  .object({
    subjectId: z.string().uuid('Asignatura inválida.'),
    dayOfWeek: dayOfWeekSchema,
    moduleIndex: moduleIndexSchema,
    duration: durationSchema.default(1),
  })
  .refine(endsInsideDay, {
    message: 'El bloque se sale de la jornada.',
    path: ['duration'],
  });

export const moveBlockSchema = z.object({
  id: blockIdSchema,
  dayOfWeek: dayOfWeekSchema,
  moduleIndex: moduleIndexSchema,
});

export const removeBlockSchema = z.object({ id: blockIdSchema });

export type PlaceBlockInput = z.infer<typeof placeBlockSchema>;
export type MoveBlockInput = z.infer<typeof moveBlockSchema>;
export type RemoveBlockInput = z.infer<typeof removeBlockSchema>;
