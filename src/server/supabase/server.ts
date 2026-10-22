import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { getSupabaseEnv } from '@/lib/supabase/env';
import type { Database } from '@/lib/supabase/database.types';

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 *
 * Lee y refresca la sesión desde las cookies de Next.js. Nunca se importa desde
 * un Client Component: la frontera está en `src/server/**`.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Un Server Component no puede escribir cookies. El middleware es
          // quien refresca la sesión en esos casos; no es un error fatal.
        }
      },
    },
  });
}

export type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;
