/**
 * Lectura de las variables públicas de Supabase.
 *
 * Las claves `NEXT_PUBLIC_*` son seguras en el navegador: la seguridad real
 * vive en RLS. La `service_role` nunca se lee acá ni se expone al cliente.
 */

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing = [
    !url ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !anonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
  ].filter((name): name is string => name !== null);

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno de Supabase: ${missing.join(', ')}. ` +
        'Copia .env.example a .env.local y completa los valores del proyecto.',
    );
  }

  return { url: url as string, anonKey: anonKey as string };
}
