-- UsachSchedule — esquema inicial del horario académico.
--
-- Nota histórica: este archivo se aplicó con la jornada provisional de 10×90 y
-- color hex. La migración 20261022065837_align_jornada_9_modules_y_paleta la
-- alinea con ADR-004 (9×80 y paleta de claves). Se conserva sin reescribir
-- porque ya está registrada en el proyecto remoto.
--
-- Tablas: profiles, subjects, schedule_blocks.
-- Reglas estructurales que se verifican en la base y no solo en la aplicación:
--   * Un alumno solo puede tener filas con su propio user_id (RLS + FKs compuestas).
--   * El código de una asignatura es único por alumno (se normaliza a mayúsculas).
--   * Un bloque no puede salirse de la jornada (1..10 módulos).
--   * Dos bloques del mismo alumno y día no pueden solaparse, ni siquiera si
--     uno tiene duración mayor que 1 (restricción de exclusión con rangos).
--
-- Jornada (ver context/contracts.md): 10 módulos de 90 minutos, desde 08:15,
-- lunes a sábado. El sábado es el día 6.

-- ---------------------------------------------------------------------------
-- Extensiones
-- ---------------------------------------------------------------------------

-- Necesaria para combinar igualdad (uuid, smallint) con solapamiento (rango)
-- en una misma restricción de exclusión.
create extension if not exists btree_gist with schema extensions;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  career text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length_check
    check (char_length(btrim(full_name)) between 1 and 80),
  constraint profiles_career_length_check
    check (career is null or char_length(btrim(career)) between 2 and 120)
);

comment on table public.profiles is
  'Datos públicos del alumno. La fila la crea el trigger handle_new_user al registrarse.';
comment on column public.profiles.id is
  'Mismo id que auth.users.id. No se crea desde el cliente.';

-- ---------------------------------------------------------------------------
-- subjects
-- ---------------------------------------------------------------------------

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  code text not null,
  level smallint not null,
  color text not null default '#64748b',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subjects_name_length_check
    check (char_length(btrim(name)) between 1 and 80),
  constraint subjects_code_format_check
    check (code ~ '^[A-Z0-9-]{2,16}$'),
  constraint subjects_level_range_check
    check (level between 1 and 6),
  constraint subjects_color_format_check
    check (color ~ '^#[0-9a-fA-F]{6}$'),
  constraint subjects_user_code_key unique (user_id, code),
  -- Permite que schedule_blocks referencie (subject_id, user_id) y así impida
  -- usar la asignatura de otro alumno a nivel de base de datos.
  constraint subjects_id_user_id_key unique (id, user_id)
);

comment on table public.subjects is
  'Asignaturas creadas por cada alumno. No hay catálogo global: cada fila pertenece a un user_id.';
comment on column public.subjects.code is
  'Código normalizado en mayúsculas, único por alumno.';
comment on column public.subjects.level is
  'Nivel o semestre de la asignatura, de 1 a 6.';

-- ---------------------------------------------------------------------------
-- schedule_blocks
-- ---------------------------------------------------------------------------

create table public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid not null,
  day_of_week smallint not null,
  module_index smallint not null,
  duration smallint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_blocks_day_range_check
    check (day_of_week between 1 and 6),
  constraint schedule_blocks_module_range_check
    check (module_index between 1 and 10),
  constraint schedule_blocks_duration_range_check
    check (duration between 1 and 10),
  -- Un bloque de duración N debe terminar dentro de la jornada.
  constraint schedule_blocks_module_span_check
    check (module_index + duration - 1 <= 10),
  -- La asignatura debe ser del mismo alumno que el bloque. Si no, la fila no
  -- existe como combinación (subject_id, user_id) y la FK falla.
  constraint schedule_blocks_subject_owner_fkey
    foreign key (subject_id, user_id)
    references public.subjects (id, user_id)
    on delete cascade,
  -- Solapamiento real: dos rangos del mismo alumno y día no pueden intersectar.
  -- Cubre el caso de duración 1 y el de bloques consecutivos.
  constraint schedule_blocks_no_overlap
    exclude using gist (
      user_id with =,
      day_of_week with =,
      (int4range(module_index::integer, (module_index + duration)::integer)) with &&
    )
);

comment on table public.schedule_blocks is
  'Bloques del horario semanal. duration indica cuántos módulos consecutivos ocupa.';
comment on constraint schedule_blocks_no_overlap on public.schedule_blocks is
  'Impide solapamientos por alumno y día, incluso con bloques de duración mayor que 1.';

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------

create index subjects_user_id_idx
  on public.subjects (user_id);

create index schedule_blocks_user_day_idx
  on public.schedule_blocks (user_id, day_of_week, module_index);

create index schedule_blocks_subject_id_idx
  on public.schedule_blocks (subject_id);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger genérico: actualiza updated_at en cada UPDATE.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger subjects_set_updated_at
  before update on public.subjects
  for each row execute function public.set_updated_at();

create trigger schedule_blocks_set_updated_at
  before update on public.schedule_blocks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Perfil automático al registrarse
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  fallback_name text;
begin
  fallback_name := coalesce(
    nullif(btrim(metadata ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Estudiante'
  );

  insert into public.profiles (id, full_name, career)
  values (
    new.id,
    left(fallback_name, 80),
    nullif(left(btrim(metadata ->> 'career'), 120), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Crea el perfil del alumno cuando Supabase Auth inserta en auth.users.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

-- No se usa `force row level security`: el trigger de alta de perfil es
-- `security definer` y se ejecuta como el dueño de la tabla; con FORCE quedaría
-- sujeto a RLS y no podría insertar el perfil recién creado. El acceso por API
-- usa el rol `authenticated`, que sí queda siempre sujeto a las políticas.
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.schedule_blocks enable row level security;

-- profiles: lectura y edición del propio perfil. El INSERT lo hace el trigger
-- (security definer), no el cliente. El DELETE ocurre al borrar el auth user.
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- subjects: CRUD completo, siempre acotado al user_id de la sesión.
create policy subjects_select_own
  on public.subjects
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy subjects_insert_own
  on public.subjects
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy subjects_update_own
  on public.subjects
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy subjects_delete_own
  on public.subjects
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- schedule_blocks: mismo criterio que subjects.
create policy schedule_blocks_select_own
  on public.schedule_blocks
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy schedule_blocks_insert_own
  on public.schedule_blocks
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy schedule_blocks_update_own
  on public.schedule_blocks
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy schedule_blocks_delete_own
  on public.schedule_blocks
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Privilegios
-- ---------------------------------------------------------------------------

-- Sin acceso anónimo: el horario es privado. El rol anon no puede leer nada.
revoke all on table public.profiles from anon;
revoke all on table public.subjects from anon;
revoke all on table public.schedule_blocks from anon;

revoke all on table public.profiles from authenticated;
revoke all on table public.subjects from authenticated;
revoke all on table public.schedule_blocks from authenticated;

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.subjects to authenticated;
grant select, insert, update, delete on table public.schedule_blocks to authenticated;

-- Funciones de trigger: no se exponen como RPC.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon;

grant execute on function public.handle_new_user()
  to supabase_auth_admin, service_role;
grant execute on function public.set_updated_at()
  to authenticated, service_role;
