import { createBrowserClient } from '@supabase/ssr';

import { getSupabaseEnv } from '@/lib/supabase/env';
import type { Database } from '@/lib/supabase/database.types';

/**
 * Cliente de Supabase para Client Components.
 *
 * Solo usa la clave anónima. La autorización la decide RLS en la base, no este
 * cliente. El frontend puede importar este archivo; nunca `src/server/**`.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();

  return createBrowserClient<Database>(url, anonKey);
}
