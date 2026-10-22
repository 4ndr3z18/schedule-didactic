# Roadmap — UsachSchedule

Plan de construcción acordado. Cada fase termina en un PR revisado por la otra persona. Los criterios de calidad están en `context/AGENTS.md` § 4.

Reparto: **Sebastián hace el frontend**, **Andrés hace el backend**. La frontera está en `context/AGENTS.md` § 3.

Estado actual: **Fase 0 completada** (repo sin código, convenciones y contratos definidos). **Fase 2 escrita** en la rama `andrez`: falta probar las migraciones contra un proyecto Supabase real y ejecutar `typecheck` cuando exista el scaffold.

---

## Fase 1 — Base técnica · Sebastián

- [ ] `create-next-app` con App Router, TypeScript `strict`, Tailwind, `src/`, alias `@/*`.
- [ ] `shadcn/ui` inicializado con tema neutro y `lucide-react`.
- [ ] Dependencias: `zod`, `react-hook-form`, `@hookform/resolvers`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@supabase/supabase-js`, `@supabase/ssr`.
- [ ] ESLint + Prettier + script `typecheck` (`tsc --noEmit`).
- [ ] CI en GitHub Actions: `lint`, `typecheck` y `build` en cada PR.
- [ ] `README.md` con la puesta en marcha real.

**Terminado cuando:** `npm run lint`, `npm run typecheck` y `npm run build` pasan en limpio, y el CI está verde en un PR de prueba.

## Fase 2 — Backend: Supabase, RLS y auth · Andrés

- [x] Proyecto Supabase y `.env.local` (no se commitea). Proyecto `schedule-didactic` (`ceibrnyeznqqsnkslmpw`, `us-east-1`).
- [x] `context/contracts.md` completo: tipos de dominio, constantes de la jornada y firma de las Server Actions.
- [x] Migración inicial de `profiles`, `subjects`, `schedule_blocks` (`supabase/migrations/20261022061151_initial_schema.sql`) y migración de índice (`20261022061429_index_subject_owner_fk.sql`).
- [x] Trigger de creación de perfil al registrarse.
- [x] RLS activo con `auth.uid() = user_id` en `SELECT`, `INSERT`, `UPDATE` y `DELETE`.
- [x] `src/lib/supabase/` y `src/server/supabase/` con clientes SSR y `database.types.ts` generado desde el proyecto real.
- [x] `src/lib/validation/` con los esquemas Zod de login, registro, asignatura y bloque.
- [x] `src/server/actions/` con las acciones de auth y CRUD.
- [x] `middleware.ts` con refresco de sesión y protección de `/horario`.
- [x] Pruebas pgTAP de aislamiento entre dos alumnos (`supabase/tests/rls.test.sql`).

**Terminado cuando:** dos usuarios de prueba no pueden leer ni modificar los datos del otro, verificado manualmente y documentado en el PR. **Verificado en remoto el 2026-10-22** con dos usuarios temporales: RLS, FK compuesta, exclusión de solapamientos, límites de jornada, código duplicado y cascadas pasaron; los usuarios de prueba se eliminaron. Además se ejecutó el flujo real **Auth (password grant) + PostgREST** con tokens: 19/20 comprobaciones con la expectativa exacta y la restante confirmó el mismo `23P01` con HTTP 400 (mapeo correcto de PostgREST).

## Fase 3 — Grilla del horario (estática) · Sebastián

No depende de la base de datos: avanza con datos mock tipados según `context/contracts.md`.

- [ ] Layout de la app: header, sidebar colapsable en móvil (Sheet de shadcn), área de contenido.
- [ ] Grilla semanal formato USACH: días en columnas, módulos en filas, encabezado de horas.
- [ ] Tarjeta de asignatura: nombre, código, nivel, color.
- [ ] Panel lateral con la lista de asignaturas del alumno.
- [ ] Skeletons y estado vacío.
- [ ] Datos mock en un solo archivo, fáciles de reemplazar por las Server Actions.

**Terminado cuando:** la grilla se ve correcta en 360 px, 768 px y 1440 px, sin scroll horizontal roto.

## Fase 4 — Interacción: drag & drop y edición · Sebastián

- [ ] `DndContext` con `PointerSensor` (`activationConstraint.delay` para pulsación prolongada) y `KeyboardSensor`.
- [ ] Arrastrar tarjeta desde el panel a un bloque libre de la grilla.
- [ ] Mover una tarjeta ya ubicada entre bloques.
- [ ] Edición de la tarjeta ubicada (nombre, código, nivel) con React Hook Form + los esquemas Zod de `src/lib/validation/`.
- [ ] Papelera con activación por pulsación prolongada.
- [ ] Feedback visual: bloque válido, bloque inválido, colisión.

**Terminado cuando:** funciona con mouse, con teclado y en un teléfono real, sin selección de texto accidental ni scroll fantasma.

## Fase 5 — Integración y cierre · Ambos

- [ ] Conectar la grilla con las Server Actions (Server Components para la carga inicial).
- [ ] Páginas de login y registro consumiendo las acciones de Andrés, con sus errores mapeados.
- [ ] Revisión cruzada de RLS y de accesibilidad.
- [ ] Revisión visual final en móvil y escritorio.
- [ ] `context/MEMORY.md`, `context/decisions.md`, `context/contracts.md` y `README.md` al día.
- [ ] Merge final a `main` y despliegue en Vercel.

---

## Cómo arrancar en paralelo sin pisarse

| Quién | Empieza con | No toca |
|---|---|---|
| Sebastián | Fase 1 (scaffold, Tailwind, shadcn, CI) → Fase 3 (grilla con mock) → Fase 4 | `supabase/`, `src/server/`, `src/lib/validation/`, `middleware.ts` |
| Andrés | `context/contracts.md` → Fase 2 (migraciones, RLS, auth, acciones) | `src/app/`, `src/components/`, `src/lib/types/domain.ts` sin avisar |

`src/lib/types/domain.ts` es compartido: debe reflejar `context/contracts.md`. Cualquier cambio se avisa en el PR.

## Dependencias críticas

1. **`context/contracts.md`** estabiliza los tipos: sin él, el mock del frontend y el esquema del backend divergen y la Fase 5 se vuelve arqueología. No bloquea la maqueta visual, sí el tipado.
2. **Fase 1** bloquea la Fase 3 y la Fase 4, y también los clientes de Supabase de la Fase 2. Las migraciones SQL, en cambio, se pueden escribir antes.
3. **Fase 2** bloquea el final de la Fase 4 (persistencia) y de la Fase 5.
4. Los esquemas Zod nacen en la Fase 2 y los consumen los formularios de la Fase 3 y 4: se escriben una vez, en `src/lib/validation/`.
