'use server';

import { actionOk, formError, type ActionResult } from '@/lib/types/action-result';
import type { Schedule } from '@/lib/types/domain';
import { GENERIC_ERROR, SESSION_ERROR } from '@/server/actions/_errors';
import { toScheduleBlock, toSubject } from '@/server/mappers';
import { getSessionUser } from '@/server/session';
import { createClient } from '@/server/supabase/server';

/**
 * Carga inicial del horario. El Server Component de `/horario` la consume
 * directamente; la UI no consulta Supabase por su cuenta.
 */
export async function getSchedule(): Promise<ActionResult<Schedule>> {
  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) {
    return formError(SESSION_ERROR);
  }

  const [subjectsResult, blocksResult] = await Promise.all([
    supabase.from('subjects').select('*').order('level').order('name'),
    supabase
      .from('schedule_blocks')
      .select('*')
      .order('day_of_week')
      .order('module_index'),
  ]);

  if (subjectsResult.error || blocksResult.error) {
    return formError(GENERIC_ERROR);
  }

  return actionOk({
    subjects: (subjectsResult.data ?? []).map(toSubject),
    blocks: (blocksResult.data ?? []).map(toScheduleBlock),
  });
}
