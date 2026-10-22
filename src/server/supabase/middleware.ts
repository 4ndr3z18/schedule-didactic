import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { getSupabaseEnv } from '@/lib/supabase/env';
import type { Database } from '@/lib/supabase/database.types';

export const PROTECTED_PREFIXES = ['/horario'] as const;
export const AUTH_ROUTES = ['/login', '/registro'] as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Refresca la sesión de Supabase en cada request y aplica las reglas de acceso:
 *
 *   * Sin sesión + ruta protegida  -> /login?redirectTo=<ruta>
 *   * Con sesión + ruta de auth    -> /horario
 *
 * Devuelve siempre una respuesta con las cookies actualizadas, también en los
 * redirects, para no perder el refresh token.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() valida el JWT contra Supabase; getSession() solo lee la cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const redirectTo = (destination: string, keepRedirectParam = false) => {
    const target = request.nextUrl.clone();
    target.pathname = destination;
    target.search = '';
    if (keepRedirectParam) {
      target.searchParams.set('redirectTo', pathname);
    }
    const redirectResponse = NextResponse.redirect(target);
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  };

  if (!user && isProtectedPath(pathname)) {
    return redirectTo('/login', true);
  }

  if (user && isAuthPath(pathname)) {
    return redirectTo('/horario');
  }

  return response;
}
