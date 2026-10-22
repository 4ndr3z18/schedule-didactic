'use server';

import { revalidatePath } from 'next/cache';
import type { PostgrestError } from '@supabase/supabase-js';

import { TOTAL_MODULES } from '@/lib/constants/schedule';
import {
  actionError,
  actionOk,
  formError,
  type ActionErrors,
  type ActionResult,
} from '@/lib/types/action-result';
import type { ScheduleBlock } from '@/lib/types/domain';
import {
  moveBlockSchema,
  placeBlockSchema,
  removeBlockSchema,
} from '@/lib/validation/block';
import {
  GENERIC_ERROR,
  SESSION_ERROR,
  isCheckViolation,
  isForeignKeyViolation,
  isOverlapViolation,
  isPermissionError,
  isUniqueViolation,
  zodActionErrors,
} from '@/server/actions/_errors';
import { toScheduleBlock } from '@/server/mappers';
import { getSessionUser } from '@/server/session';
import { createClient } from '@/server/supabase/server';

/** Errores de escritura de bloques, ya traducidos a campos del formulario. */
function mapBlockError(error: PostgrestError): ActionErrors {
  if (isOverlapViolation(error) || isUniqueViolation(error)) {
    return { moduleIndex: ['Ese bloque se cruza con otra clase.'] };
  }
  if (isCheckViolation(error)) {
    return {
      moduleIndex: [`El bloque se sale de la jornada de ${TOTAL_MODULES} módulos.`],
    };
  }
  if (isForeignKeyViolation(error)) {
    return { subjectId: ['La asignatura no existe o no te pertenece.'] };
  }
  if (isPermissionError(error)) {
    return { _form: ['No tienes permisos para modificar este horario.'] };
  }
  return { _form: [GENERIC_ERROR] };
}

export async function placeBlock(
  input: unknown,
): Promise<ActionResult<ScheduleBlock>> {
  const parsed = placeBlockSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(zodActionErrors(parsed.error));
  }

  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) {
    return formError(SESSION_ERROR);
  }

  // Comprobación explícita para devolver un error de campo claro; la FK
  // compuesta y RLS vuelven a verificar lo mismo en la base.
  const { data: subject, error: subjectError } = await supabase
    .from('subjects')
    .select('id')
    .eq('id', parsed.data.subjectId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (subjectError) {
    return formError(GENERIC_ERROR);
  }

  if (!subject) {
    return actionError({
      subjectId: ['La asignatura no existe o no te pertenece.'],
    });
  }

  const { data, error } = await supabase
    .from('schedule_blocks')
    .insert({
      user_id: user.id,
      subject_id: parsed.data.subjectId,
      day_of_week: parsed.data.dayOfWeek,
      module_index: parsed.data.moduleIndex,
      duration: parsed.data.duration,
    })
    .select('*')
    .single();

  if (error) {
    return actionError(mapBlockError(error));
  }

  revalidatePath('/horario');
  return actionOk(toScheduleBlock(data));
}

export async function moveBlock(
  input: unknown,
): Promise<ActionResult<ScheduleBlock>> {
  const parsed = moveBlockSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(zodActionErrors(parsed.error));
  }

  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) {
    return formError(SESSION_ERROR);
  }

  const { data: current, error: currentError } = await supabase
    .from('schedule_blocks')
    .select('*')
    .eq('id', parsed.data.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (currentError) {
    return formError(GENERIC_ERROR);
  }

  if (!current) {
    return formError('El bloque no existe o no te pertenece.');
  }

  // El movimiento conserva la duración: hay que verificar que el bloque entero
  // siga cabiendo en la jornada antes de tocar la base.
  if (parsed.data.moduleIndex + current.duration - 1 > TOTAL_MODULES) {
    return actionError({
      moduleIndex: ['El bloque se sale de la jornada.'],
    });
  }

  const { data, error } = await supabase
    .from('schedule_blocks')
    .update({
      day_of_week: parsed.data.dayOfWeek,
      module_index: parsed.data.moduleIndex,
    })
    .eq('id', parsed.data.id)
    .eq('user_id', user.id)
    .select('*')
    .maybeSingle();

  if (error) {
    return actionError(mapBlockError(error));
  }

  if (!data) {
    return formError('El bloque no existe o no te pertenece.');
  }

  revalidatePath('/horario');
  return actionOk(toScheduleBlock(data));
}

export async function removeBlock(
  input: unknown,
): Promise<ActionResult<void>> {
  const parsed = removeBlockSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(zodActionErrors(parsed.error));
  }

  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) {
    return formError(SESSION_ERROR);
  }

  const { data, error } = await supabase
    .from('schedule_blocks')
    .delete()
    .eq('id', parsed.data.id)
    .eq('user_id', user.id)
    .select('id');

  if (error) {
    if (isPermissionError(error)) {
      return formError('No tienes permisos para eliminar este bloque.');
    }
    return formError(GENERIC_ERROR);
  }

  if (!data || data.length === 0) {
    return formError('El bloque no existe o no te pertenece.');
  }

  revalidatePath('/horario');
  return actionOk(undefined);
}
