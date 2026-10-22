# UsachSchedule

Planificador de horario académico para estudiantes de la Universidad de Santiago de Chile. Permite construir el horario semanal arrastrando tarjetas de asignaturas sobre una grilla de módulos, en escritorio y en móvil.

Repository name: `schedule-didactic`.

---

## Estado

Fase 0 completada: convenciones y plan definidos. Siguiente: Fase 1 (scaffold de Next.js), ver [`docs/roadmap.md`](./docs/roadmap.md).

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js (App Router) |
| Lenguaje | TypeScript (`strict: true`) |
| Estilos | Tailwind CSS |
| Componentes | shadcn/ui (Radix Primitives) |
| Datos y Auth | Supabase (Postgres + Auth + RLS) |
| Validación | Zod |
| Formularios | React Hook Form + resolvers |
| Drag & Drop | @dnd-kit |
| Iconos | lucide-react |

El detalle de reglas, estilo y criterios de aceptación está en [`AGENTS.md`](./AGENTS.md).

## Estructura del repositorio

```
AGENTS.md                 Punto de partida. Contrato técnico y de trabajo.
docs/roadmap.md           Fases, tareas, responsables y dependencias.
docs/contracts.md         Puente frontend/backend: tipos, constantes y acciones.
docs/decisions.md         Decisiones (ADR) con su justificación.
MEMORY.md                 Estado compartido y acotado (máximo 50 palabras).
MEMORY.local.example.md   Plantilla de memoria personal. Copiar a MEMORY.local.md.
MEMORY.local.md           Tu memoria personal. Ignorada por git.
```

## Reparto del trabajo

| Quién | Capa | Rutas |
|---|---|---|
| Sebastián | Frontend | `src/app/`, `src/components/`, scaffold, Tailwind, shadcn/ui, CI. |
| Andrés | Backend | `supabase/`, `src/server/`, `src/lib/validation/`, `middleware.ts`. |

La frontera completa está en [`AGENTS.md` § 3](./AGENTS.md). El frontend consume Server Actions y tipos; nunca importa `src/server/supabase/*`. El puente entre ambos es [`docs/contracts.md`](./docs/contracts.md).

## Trabajo en equipo

Dos desarrolladores, cada uno con su propia sesión de OpenCode. Reglas completas en [`AGENTS.md`](./AGENTS.md), secciones "Punto de entrada" y "Trabajo en Equipo y Control de Versiones".

1. `git pull --rebase origin main` antes de empezar.
2. Trabajar en la rama personal (`sebastian`, `andrez`). Nunca commitear directo a `main`.
3. Integrar por Pull Request con revisión del compañero.
4. Al cerrar la tarea: actualizar `MEMORY.local.md`, `MEMORY.md` (si afecta al compañero) y `docs/decisions.md`.
5. Si no tienes `MEMORY.local.md`, copia `MEMORY.local.example.md`; el archivo resultante queda fuera de git.

Qué construir y en qué orden: [`docs/roadmap.md`](./docs/roadmap.md).

## Puesta en marcha (cuando exista el scaffold)

```bash
npm install
cp .env.example .env.local   # completar con las credenciales de Supabase
npm run dev
```

En Windows con PowerShell, si `npm` está bloqueado por la política de ejecución de scripts, usar `npm.cmd` o `cmd /c npm ...`.

### Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Nunca exponer la `service_role` key en el cliente ni commitear `.env.local`.
