'use server';

import { revalidatePath } from 'next/cache';
import type { AuthError } from '@supabase/supabase-js';

import {
  actionError,
  actionOk,
  formError,
  type ActionErrors,
  type ActionResult,
} from '@/lib/types/action-result';
import { loginSchema, registerSchema } from '@/lib/validation/auth';
import { GENERIC_ERROR, zodActionErrors } from '@/server/actions/_errors';
import { createClient } from '@/server/supabase/server';

/**
 * Traduce los errores de Supabase Auth a mensajes en español.
 * La UI nunca ve el mensaje original de GoTrue.
 */
function mapAuthError(error: AuthError): ActionErrors {
  switch (error.code) {
    case 'invalid_credentials':
      return { _form: ['Correo o contraseña incorrectos.'] };
    case 'email_not_confirmed':
      return { email: ['Confirma tu correo antes de ingresar.'] };
    case 'user_already_exists':
    case 'email_exists':
      return { email: ['Ese correo ya está registrado.'] };
    case 'weak_password':
      return { password: ['La contraseña es demasiado débil.'] };
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return { _form: ['Demasiados intentos. Espera un momento.'] };
    default:
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        return { _form: ['Correo o contraseña incorrectos.'] };
      }
      return { _form: [GENERIC_ERROR] };
  }
}

export async function login(input: unknown): Promise<ActionResult<void>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(zodActionErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return actionError(mapAuthError(error));
  }

  revalidatePath('/', 'layout');
  return actionOk(undefined);
}

export async function register(input: unknown): Promise<ActionResult<void>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(zodActionErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        career: parsed.data.career ?? null,
      },
    },
  });

  if (error) {
    return actionError(mapAuthError(error));
  }

  // Si el proyecto exige confirmación por correo, `data.session` viene null y
  // la UI debe mostrar "revisa tu correo". El trigger ya creó el perfil.
  revalidatePath('/', 'layout');
  return actionOk(undefined);
}

export async function logout(): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return formError(GENERIC_ERROR);
  }

  revalidatePath('/', 'layout');
  return actionOk(undefined);
}
