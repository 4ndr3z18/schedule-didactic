import type { DayOfWeek } from '@/lib/constants/schedule';
import type { Tables } from '@/lib/supabase/database.types';
import type {
  Level,
  ScheduleBlock,
  StudentProfile,
  Subject,
} from '@/lib/types/domain';

/**
 * Traducción de filas de Postgres (snake_case) a tipos de dominio (camelCase).
 * Toda la conversión vive en el backend; el frontend nunca ve snake_case.
 */

export function toStudentProfile(row: Tables<'profiles'>): StudentProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    career: row.career,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toSubject(row: Tables<'subjects'>): Subject {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    code: row.code,
    level: row.level as Level,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toScheduleBlock(row: Tables<'schedule_blocks'>): ScheduleBlock {
  return {
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    dayOfWeek: row.day_of_week as DayOfWeek,
    moduleIndex: row.module_index,
    duration: row.duration,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
