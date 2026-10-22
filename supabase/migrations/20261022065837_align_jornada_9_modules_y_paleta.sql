-- Alinea la base de datos con ADR-004 de `main`.
--
-- La rama `andrez` se implementó inicialmente con 10 módulos de 90 minutos y
-- colores hexadecimales. La jornada confirmada por el producto y por el
-- frontend es de 9 módulos de 80 minutos, y el color es una clave de la paleta
-- (`clay`, `teal`, `amber`, `olive`, `green`, `rose`, `blue`, `violet`).
--
-- Esta migración no toca la estructura de las tablas: solo los rangos, el
-- valor por defecto y los comentarios. Se aplica sobre un proyecto sin datos;
-- si existieran filas incompatibles, la migración falla a propósito para que
-- la conversión se haga a mano en vez de perder información.

do $$
begin
  if exists (
    select 1
    from public.subjects
    where color not in (
      'clay', 'teal', 'amber', 'olive', 'green', 'rose', 'blue', 'violet'
    )
  ) then
    raise exception
      'Hay asignaturas con colores fuera de la paleta. Conviértelas antes de aplicar esta migración.';
  end if;

  if exists (
    select 1
    from public.schedule_blocks
    where module_index not between 1 and 9
      or duration not between 1 and 9
      or module_index + duration - 1 > 9
  ) then
    raise exception
      'Hay bloques fuera de la jornada de 9 módulos. Muévelos o elimínalos antes de aplicar esta migración.';
  end if;
end $$;

-- Color: clave de la paleta, no hex libre.
alter table public.subjects
  alter column color set default 'clay';

alter table public.subjects
  drop constraint if exists subjects_color_format_check;

alter table public.subjects
  add constraint subjects_color_format_check
  check (
    color in ('clay', 'teal', 'amber', 'olive', 'green', 'rose', 'blue', 'violet')
  );

comment on column public.subjects.color is
  'Clave de la paleta de asignaturas: clay, teal, amber, olive, green, rose, blue o violet.';

-- Jornada: 9 módulos, duración máxima 9, sin salirse por abajo.
alter table public.schedule_blocks
  drop constraint if exists schedule_blocks_module_range_check;

alter table public.schedule_blocks
  add constraint schedule_blocks_module_range_check
  check (module_index between 1 and 9);

alter table public.schedule_blocks
  drop constraint if exists schedule_blocks_duration_range_check;

alter table public.schedule_blocks
  add constraint schedule_blocks_duration_range_check
  check (duration between 1 and 9);

alter table public.schedule_blocks
  drop constraint if exists schedule_blocks_module_span_check;

alter table public.schedule_blocks
  add constraint schedule_blocks_module_span_check
  check (module_index + duration - 1 <= 9);

comment on column public.schedule_blocks.module_index is
  'Módulo inicial del bloque, de 1 a 9. Ver ADR-004.';

comment on column public.schedule_blocks.duration is
  'Cantidad de módulos consecutivos que ocupa el bloque, de 1 a 9.';
