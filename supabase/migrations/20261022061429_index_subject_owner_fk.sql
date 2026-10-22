-- Cubre la FK compuesta schedule_blocks (subject_id, user_id) y reemplaza el
-- índice simple por subject_id, que quedaba redundante.
--
-- Detectado por el advisor de rendimiento de Supabase:
--   unindexed_foreign_keys · schedule_blocks_subject_owner_fkey

create index schedule_blocks_subject_owner_idx
  on public.schedule_blocks (subject_id, user_id);

drop index if exists public.schedule_blocks_subject_id_idx;
