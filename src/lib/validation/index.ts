/**
 * Punto único de importación de los esquemas Zod.
 *
 * El frontend usa estos mismos esquemas en React Hook Form; no se duplican
 * reglas de validación en los formularios.
 */

export * from '@/lib/validation/auth';
export * from '@/lib/validation/block';
export * from '@/lib/validation/subject';
