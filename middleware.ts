import type { NextRequest } from 'next/server';

import { updateSession } from '@/server/supabase/middleware';

/**
 * Punto de entrada del middleware de Next.js.
 *
 * La lógica vive en `src/server/supabase/middleware.ts` (backend). Acá solo se
 * conecta con el runtime de Next.js y se excluyen los assets estáticos.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)',
  ],
};
