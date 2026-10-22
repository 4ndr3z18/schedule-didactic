import type { PostgrestError } from '@supabase/supabase-js';
import type { ZodError } from 'zod';

import type { ActionErrors } from '@/lib/types/action-result';

/** Mensaje único para no filtrar detalles internos de Postgres al cliente. */
export const GENERIC_ERROR =
  'No pudimos completar la operación. Intenta nuevamente.';

export const SESSION_ERROR = 'Tu sesión expiró. Vuelve a iniciar sesión.';

/** Convierte un ZodError en el mapa `campo -> mensajes` del contrato. */
export function zodActionErrors(error: ZodError): ActionErrors {
  const errors: ActionErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : '_form';
    (errors[key] ??= []).push(issue.message);
  }

  return errors;
}

export function isUniqueViolation(error: PostgrestError): boolean {
  return error.code === '23505';
}

export function isOverlapViolation(error: PostgrestError): boolean {
  return error.code === '23P01';
}

export function isCheckViolation(error: PostgrestError): boolean {
  return error.code === '23514';
}

export function isForeignKeyViolation(error: PostgrestError): boolean {
  return error.code === '23503';
}

export function isPermissionError(error: PostgrestError): boolean {
  return error.code === '42501';
}
