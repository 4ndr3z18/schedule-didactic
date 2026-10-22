import type { User } from '@supabase/supabase-js';

import type { ServerSupabaseClient } from '@/server/supabase/server';

/**
 * Devuelve el usuario autenticado o `null`.
 *
 * Usa `auth.getUser()`, que valida el token contra Supabase Auth. Nunca se usa
 * `getSession()` en el servidor para decidir permisos.
 */
export async function getSessionUser(
  supabase: ServerSupabaseClient,
): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}
