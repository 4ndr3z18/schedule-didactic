import { z } from 'zod';

import { DEFAULT_SUBJECT_COLOR } from '@/lib/constants/limits';
import type { Level } from '@/lib/types/domain';

/** Esquemas de asignaturas. El backend los aplica y el formulario los reutiliza. */

export const SUBJECT_LEVELS = [1, 2, 3, 4, 5, 6] as const;

export const subjectIdSchema = z.string().uuid('Identificador inválido.');

export const subjectNameSchema = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres.')
  .max(80, 'El nombre no puede superar los 80 caracteres.');

export const subjectCodeSchema = z
  .string()
  .trim()
  .min(2, 'El código debe tener al menos 2 caracteres.')
  .max(16, 'El código no puede superar los 16 caracteres.')
  .regex(
    /^[A-Za-z0-9-]+$/,
    'El código solo admite letras, números y guiones.',
  )
  .transform((value) => value.toUpperCase());

export const subjectColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, 'El color debe tener el formato #RRGGBB.')
  .transform((value) => value.toLowerCase());

export const subjectLevelSchema = z.coerce
  .number()
  .min(1, 'El nivel debe estar entre 1 y 6.')
  .max(6, 'El nivel debe estar entre 1 y 6.')
  .refine(Number.isInteger, 'El nivel debe ser un número entero.')
  .transform((value) => value as Level);

const subjectFields = z.object({
  name: subjectNameSchema,
  code: subjectCodeSchema,
  level: subjectLevelSchema,
  color: subjectColorSchema,
});

export const createSubjectSchema = subjectFields.extend({
  color: subjectColorSchema.default(DEFAULT_SUBJECT_COLOR),
});

export const updateSubjectSchema = subjectFields
  .partial()
  .extend({ id: subjectIdSchema })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.code !== undefined ||
      value.level !== undefined ||
      value.color !== undefined,
    {
      message: 'Indica al menos un campo para actualizar.',
      path: ['_form'],
    },
  );

export const deleteSubjectSchema = z.object({ id: subjectIdSchema });

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type DeleteSubjectInput = z.infer<typeof deleteSubjectSchema>;
