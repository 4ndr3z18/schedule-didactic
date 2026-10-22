-- Pruebas de RLS y restricciones del horario con pgTAP.
--
-- Ejecutar con la CLI de Supabase:
--   supabase test db
--
-- Crea dos alumnos temporales, escribe como cada uno y comprueba que no
-- puedan leer ni modificar los datos del otro. Todo ocurre dentro de una
-- transacción que se revierte al final.

begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(14);

-- ---------------------------------------------------------------------------
-- Fixtures: dos usuarios de Auth. El trigger handle_new_user crea sus perfiles.
-- ---------------------------------------------------------------------------

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'ana@example.com',
    extensions.crypt('secreto-ana', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Ana Pérez","career":"Ingeniería Civil Informática"}'::jsonb,
    now(),
    now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'bruno@example.com',
    extensions.crypt('secreto-bruno', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Bruno Díaz"}'::jsonb,
    now(),
    now()
  );

select extensions.is(
  (select count(*)::integer from public.profiles),
  2,
  'el trigger crea un perfil por cada usuario de Auth'
);

select extensions.is(
  (select full_name from public.profiles
    where id = '11111111-1111-1111-1111-111111111111'),
  'Ana Pérez',
  'el perfil toma full_name de raw_user_meta_data'
);

-- ---------------------------------------------------------------------------
-- Sesión de Ana
-- ---------------------------------------------------------------------------

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}',
  true
);
select set_config(
  'request.jwt.claim.sub',
  '11111111-1111-1111-1111-111111111111',
  true
);

select extensions.is(
  (select count(*)::integer from public.profiles),
  1,
  'Ana solo ve su propio perfil'
);

select extensions.lives_ok(
  $$
    insert into public.subjects (id, user_id, name, code, level)
    values (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '11111111-1111-1111-1111-111111111111',
      'Cálculo I',
      'MAT-101',
      1
    )
  $$,
  'Ana puede crear una asignatura propia'
);

select extensions.is(
  (select count(*)::integer from public.subjects),
  1,
  'Ana ve solo sus asignaturas'
);

select extensions.lives_ok(
  $$
    insert into public.schedule_blocks (
      user_id, subject_id, day_of_week, module_index, duration
    )
    values (
      '11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      1,
      1,
      2
    )
  $$,
  'Ana puede ubicar un bloque de dos módulos'
);

select extensions.throws_ok(
  $$
    insert into public.schedule_blocks (
      user_id, subject_id, day_of_week, module_index, duration
    )
    values (
      '11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      1,
      2,
      1
    )
  $$,
  '23P01',
  'un bloque que se solapa con otro se rechaza en la base'
);

select extensions.throws_ok(
  $$
    insert into public.schedule_blocks (
      user_id, subject_id, day_of_week, module_index, duration
    )
    values (
      '11111111-1111-1111-1111-111111111111',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      6,
      9,
      2
    )
  $$,
  '23514',
  'un bloque que se sale de la jornada se rechaza en la base'
);

select extensions.is(
  (select count(*)::integer from public.schedule_blocks),
  1,
  'Ana ve su bloque'
);

-- ---------------------------------------------------------------------------
-- Sesión de Bruno
-- ---------------------------------------------------------------------------

select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}',
  true
);
select set_config(
  'request.jwt.claim.sub',
  '22222222-2222-2222-2222-222222222222',
  true
);

select extensions.is(
  (select count(*)::integer from public.subjects),
  0,
  'Bruno no ve las asignaturas de Ana'
);

select extensions.is(
  (select count(*)::integer from public.schedule_blocks),
  0,
  'Bruno no ve los bloques de Ana'
);

select extensions.throws_ok(
  $$
    insert into public.subjects (user_id, name, code, level)
    values (
      '11111111-1111-1111-1111-111111111111',
      'Física I',
      'FIS-101',
      1
    )
  $$,
  '42501',
  'Bruno no puede crear una asignatura a nombre de Ana'
);

select extensions.throws_ok(
  $$
    insert into public.schedule_blocks (
      user_id, subject_id, day_of_week, module_index, duration
    )
    values (
      '22222222-2222-2222-2222-222222222222',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      2,
      1,
      1
    )
  $$,
  '23503',
  'Bruno no puede usar la asignatura de Ana en su horario'
);

-- ---------------------------------------------------------------------------
-- Borrado en cascada
-- ---------------------------------------------------------------------------

select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}',
  true
);
select set_config(
  'request.jwt.claim.sub',
  '11111111-1111-1111-1111-111111111111',
  true
);

delete from public.subjects
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

select extensions.is(
  (select count(*)::integer from public.schedule_blocks),
  0,
  'borrar la asignatura arrastra sus bloques'
);

select * from extensions.finish();

rollback;
