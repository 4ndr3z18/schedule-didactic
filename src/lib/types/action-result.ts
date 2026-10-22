/**
 * Resultado uniforme de toda Server Action.
 *
 * La UI nunca recibe un error de Supabase: recibe `{ ok: false, errors }` con
 * mensajes en español indexados por campo. La clave `_form` agrupa los errores
 * que no pertenecen a un campo concreto.
 */

export type ActionErrors = Record<string, string[]>;

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; errors: ActionErrors };

export function actionOk<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function actionError<T = never>(
  errors: ActionErrors,
): ActionResult<T> {
  return { ok: false, errors };
}

/** Atajo para un error general que la UI muestra encima del formulario. */
export function formError<T = never>(message: string): ActionResult<T> {
  return actionError<T>({ _form: [message] });
}
