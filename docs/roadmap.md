# Roadmap — UsachSchedule

Plan de construcción acordado. Cada fase termina en un PR revisado por la otra persona. Los criterios de calidad están en `AGENTS.md` § 4.

Estado actual: **Fase 0 completada** (repo sin código, convenciones definidas).

---

## Fase 1 — Base técnica · Sebastián

- [ ] `create-next-app` con App Router, TypeScript `strict`, Tailwind, `src/`, alias `@/*`.
- [ ] `shadcn/ui` inicializado con tema neutro y `lucide-react`.
- [ ] Dependencias: `zod`, `react-hook-form`, `@hookform/resolvers`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@supabase/supabase-js`, `@supabase/ssr`.
- [ ] ESLint + Prettier + script `typecheck` (`tsc --noEmit`).
- [ ] CI en GitHub Actions: `lint`, `typecheck` y `build` en cada PR.
- [ ] `README.md` con la puesta en marcha real.

**Terminado cuando:** `npm run lint`, `npm run typecheck` y `npm run build` pasan en limpio, y el CI está en verde en un PR de prueba.

## Fase 2 — Supabase: schema, RLS y auth · Sebastián

Depende de: **ADR-004 confirmado** (módulos y duración de la jornada).

- [ ] Proyecto Supabase y `.env.local` (no se commitea).
- [ ] Migración inicial de `profiles`, `subjects`, `schedule_blocks` según ADR-004.
- [ ] Trigger de creación de perfil al registrarse.
- [ ] RLS activo con `auth.uid() = user_id` en `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
- [ ] Tipos generados en `src/lib/supabase/database.types.ts`.
- [ ] Cliente SSR (`@supabase/ssr`) + `middleware.ts` protegiendo `/horario`.
- [ ] `/login` y `/register` con Server Actions, Zod y mensajes de error en español.

**Terminado cuando:** dos usuarios de prueba no pueden leer ni modificar los datos del otro, verificado manualmente y documentado en el PR.

## Fase 3 — Grilla del horario (estática) · Andrés

**No depende de la Fase 2.** Avanza en paralelo con datos mock.

- [ ] Layout de la app: header, sidebar colapsable en móvil (Sheet de shadcn), área de contenido.
- [ ] Grilla semanal formato USACH: días en columnas, módulos en filas, encabezado de horas.
- [ ] Tarjeta de asignatura: nombre, código, nivel, color.
- [ ] Panel lateral con la lista de asignaturas del alumno.
- [ ] Skeletons y estado vacío.
- [ ] Datos mock tipados en un solo archivo, fácil de reemplazar por Supabase.

**Terminado cuando:** la grilla se ve correcta en 360 px, 768 px y 1440 px, sin scroll horizontal roto.

## Fase 4 — Interacción: drag & drop y edición · Andrés

Depende de: Fase 3. La persistencia se conecta al final, cuando exista la Fase 2.

- [ ] `DndContext` con `PointerSensor` (`activationConstraint.delay` para pulsación prolongada) y `KeyboardSensor`.
- [ ] Arrastrar tarjeta desde el panel a un bloque libre de la grilla.
- [ ] Mover una tarjeta ya ubicada entre bloques.
- [ ] Edición de la tarjeta ubicada (nombre, código, nivel) con React Hook Form + Zod.
- [ ] Papelera con activación por pulsación prolongada.
- [ ] Feedback visual: bloque válido, bloque inválido, colisión.

**Terminado cuando:** la interacción funciona con mouse, con teclado y en un teléfono real, sin selección de texto accidental ni scroll fantasma.

## Fase 5 — Integración y cierre · Ambos

- [ ] Conectar la grilla con Supabase (Server Components para la carga inicial, Server Actions para las mutaciones).
- [ ] Manejo de errores y estados de carga en todas las mutaciones.
- [ ] Revisión cruzada de RLS y de accesibilidad.
- [ ] Revisión visual final en móvil y escritorio.
- [ ] `MEMORY.md`, `docs/decisions.md` y `README.md` al día.
- [ ] Merge final a `main` y despliegue en Vercel.

---

## Cómo arrancar en paralelo sin pisarse

| Quién | Puede empezar hoy con | No tocar todavía |
|---|---|---|
| Sebastián | Fase 1 completa; en cuanto ADR-004 esté confirmado, Fase 2 | `src/components/schedule/`, `src/app/(app)/horario/` |
| Andrés | Fase 3 con datos mock | `supabase/`, `src/lib/supabase/`, `src/app/(auth)/` |

`src/components/ui/` (componentes de shadcn) lo genera la Fase 1; a partir de ahí, si alguien necesita un componente nuevo, lo agrega y lo avisa en el PR.

## Dependencias críticas

1. **ADR-004** bloquea la Fase 2 y, por lo tanto, el final de la Fase 4.
2. **Fase 1** bloquea todo lo demás: sin scaffold no hay dónde escribir.
3. **Fase 3** no bloquea la Fase 2, pero la Fase 4 sí necesita ambas.
