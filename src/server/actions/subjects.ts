'use server';

import { revalidatePath } from 'next/cache';

import { MAX_SUBJECTS_PER_STUDENT } from '@/lib/constants/limits';
import {
  actionError,
  actionOk,
  formError,
  type ActionResult,
} from '@/lib/types/action-result';
import type { Subject } from '@/lib/types/domain';
import {
  createSubjectSchema,
  deleteSubjectSchema,
  updateSubjectSchema,
} from '@/lib/validation/subject';
import {
  GENERIC_ERROR,
  SESSION_ERROR,
  isPermissionError,
  isUniqueViolation,
  zodActionErrors,
} from '@/server/actions/_errors';
import { toSubject } from '@/server/mappers';
import { getSessionUser } from '@/server/session';
import { createClient } from '@/server/supabase/server';

export async function createSubject(
  input: unknown,
): Promise<ActionResult<Subject>> {
  const parsed = createSubjectSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(zodActionErrors(parsed.error));
  }

  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) {
    return formError(SESSION_ERROR);
  }

  const { count, error: countError } = await supabase
    .from('subjects')
    .select('id', { count: 'exact', head: true });

  if (countError) {
    return formError(GENERIC_ERROR);
  }

  if ((count ?? 0) >= MAX_SUBJECTS_PER_STUDENT) {
    return formError(
      `Llegaste al máximo de ${MAX_SUBJECTS_PER_STUDENT} asignaturas. Elimina una para crear otra.`,
    );
  }

  const { data, error } = await supabase
    .from('subjects')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      code: parsed.data.code,
      level: parsed.data.level,
      color: parsed.data.color,
    })
    .select('*')
    .single();

  if (error) {
    if (isUniqueViolation(error)) {
      return actionError({
        code: ['Ya tienes una asignatura con ese código.'],
      });
    }
    if (isPermissionError(error)) {
      return formError('No tienes permisos para crear esta asignatura.');
    }
    return formError(GENERIC_ERROR);
  }

  revalidatePath('/horario');
  return actionOk(toSubject(data));
}

export async function updateSubject(
  input: unknown,
): Promise<ActionResult<Subject>> {
  const parsed = updateSubjectSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(zodActionErrors(parsed.error));
  }

  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) {
    return formError(SESSION_ERROR);
  }

  const { id, ...changes } = parsed.data;

  const { data, error } = await supabase
    .from('subjects')
    .update(changes)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .maybeSingle();

  if (error) {
    if (isUniqueViolation(error)) {
      return actionError({
        code: ['Ya tienes una asignatura con ese código.'],
      });
    }
    if (isPermissionError(error)) {
      return formError('No tienes permisos para editar esta asignatura.');
    }
    return formError(GENERIC_ERROR);
  }

  if (!data) {
    return formError('La asignatura no existe o no te pertenece.');
  }

  revalidatePath('/horario');
  return actionOk(toSubject(data));
}

export async function deleteSubject(
  input: unknown,
): Promise<ActionResult<void>> {
  const parsed = deleteSubjectSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(zodActionErrors(parsed.error));
  }

  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) {
    return formError(SESSION_ERROR);
  }

  const { data, error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', parsed.data.id)
    .eq('user_id', user.id)
    .select('id');

  if (error) {
    if (isPermissionError(error)) {
      return formError('No tienes permisos para eliminar esta asignatura.');
    }
    return formError(GENERIC_ERROR);
  }

  if (!data || data.length === 0) {
    return formError('La asignatura no existe o no te pertenece.');
  }

  revalidatePath('/horario');
  return actionOk(undefined);
}
