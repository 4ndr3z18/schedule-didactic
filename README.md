# UsachSchedule

Planificador de horario académico para estudiantes de la Universidad de Santiago de Chile. Permite construir el horario semanal arrastrando tarjetas de asignaturas sobre una grilla de módulos, en escritorio y en móvil.

Repository name: `schedule-didactic`.

---

## Estado

Fase 1 completada, Fase 3 completada y Fase 4 en curso: la app corre con Next.js, la grilla semanal estática funciona con datos de ejemplo, ya se puede mover tarjetas y descargar la semana como PNG. La Fase 2 (backend Supabase) está implementada y **verificada contra el proyecto remoto**. Falta la Fase 5: páginas de auth, middleware raíz e integración de la grilla con las Server Actions. Detalle en [`context/roadmap.md`](./context/roadmap.md).

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js (App Router) |
| Lenguaje | TypeScript (`strict: true`) |
| Estilos | Tailwind CSS |
| Componentes | shadcn/ui (Base UI) |
| Datos y Auth | Supabase (Postgres + Auth + RLS) |
| Validación | Zod |
| Formularios | React Hook Form + resolvers |
| Drag & Drop | @dnd-kit |
| Iconos | lucide-react |

El detalle de reglas, estilo y criterios de aceptación está en [`context/AGENTS.md`](./context/AGENTS.md).

## Estructura del repositorio

El contexto y el código viven separados: nada de documentación suelta en la raíz.

```
AGENTS.md                 Puntero de entrada para cualquier agente. Apunta a context/.
README.md                 Este archivo.
context/                  Todo el contexto del proyecto.
  AGENTS.md               Contrato técnico y de trabajo.
  roadmap.md              Fases, tareas, responsables y dependencias.
  contracts.md            Puente frontend/backend: tipos, constantes y acciones.
  decisions.md            Decisiones (ADR) con su justificación.
  MEMORY.md               Estado compartido y acotado (máximo 50 palabras).
  MEMORY.local.example.md Plantilla de memoria personal. Copiar a MEMORY.local.md.
  MEMORY.local.md         Memoria personal. Ignorada por git.
src/                      Código de la aplicación (frontend y backend).
supabase/                 Migraciones, seed, configuración local y pruebas RLS.
  migrations/             Esquema, triggers, restricciones y políticas RLS.
  tests/rls.test.sql      Pruebas de aislamiento entre dos alumnos.
.env.example              Variables de entorno requeridas.
```

## Reparto del trabajo

| Quién | Capa | Rutas |
|---|---|---|
| Sebastián | Frontend | `src/app/`, `src/components/`, scaffold, Tailwind, shadcn/ui, CI. |
| Andrés | Backend | `supabase/`, `src/server/`, `src/lib/validation/`, `src/server/supabase/middleware.ts`. |

La frontera completa está en [`context/AGENTS.md` § 3](./context/AGENTS.md). El frontend consume Server Actions y tipos; nunca importa `src/server/supabase/*`. El puente entre ambos es [`context/contracts.md`](./context/contracts.md).

## Trabajo en equipo

Dos desarrolladores, cada uno con su propia sesión de OpenCode. Reglas completas en [`context/AGENTS.md`](./context/AGENTS.md), secciones "Punto de entrada" y "Trabajo en Equipo y Control de Versiones".

1. `git pull --rebase origin main` antes de empezar.
2. Trabajar en la rama personal (`sebastian`, `andrez`). Nunca commitear directo a `main`.
3. Integrar por Pull Request con revisión del compañero.
4. Al cerrar la tarea: actualizar `context/MEMORY.local.md`, `context/MEMORY.md` (si afecta al compañero) y `context/decisions.md`.
5. Si no tienes `context/MEMORY.local.md`, copia `context/MEMORY.local.example.md`; el archivo resultante queda fuera de git.

Qué construir y en qué orden: [`context/roadmap.md`](./context/roadmap.md).

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completar con las credenciales del proyecto Supabase
npm run dev                  # http://localhost:3000
```

Scripts disponibles:

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Build de producción. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run format` | Prettier sobre todo el repo. |
| `npm run format:check` | Verifica formato sin escribir. |

En Windows con PowerShell, si `npm` está bloqueado por la política de ejecución de scripts, usar `npm.cmd` o `cmd /c npm ...`.

### Estructura del código

```
src/app/(app)/layout.tsx          Shell: header y contenedor
src/app/(app)/horario/            Página del horario, loading y error
src/components/schedule/          Grilla, tarjetas, panel y estados
src/components/ui/                Componentes de shadcn/ui
src/lib/schedule/                 Constantes de la jornada, paleta y datos de ejemplo
src/lib/constants/                Wrapper de la jornada y límites del backend
src/lib/types/domain.ts           Tipos compartidos con el backend
src/lib/validation/               Esquemas Zod compartidos con los formularios
src/lib/supabase/                 Tipos de la base y cliente de navegador
src/server/supabase/              Cliente SSR y refresco de sesión
src/server/actions/               login, register, logout, CRUD y getSchedule
```

La grilla usa `src/lib/schedule/constants.ts` como única fuente de los módulos: **9 bloques de 80 minutos**, lunes a sábado, con los horarios y recreos de ADR-004. El backend los consume desde `src/lib/constants/schedule.ts`; no los duplica.

### Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Nunca exponer la `service_role` key en el cliente ni commitear `.env.local`.

El proyecto remoto tiene la confirmación de correo activada: al registrarse, Supabase responde sin sesión y la UI debe mostrar «revisa tu correo». En local, `supabase/config.toml` la desactiva para agilizar las pruebas.

## Backend (Supabase)

Proyecto remoto: **`schedule-didactic`** (`ceibrnyeznqqsnkslmpw`, `us-east-1`). Tiene aplicadas la migración inicial, la de índice de la FK compuesta y la de alineación con ADR-004 (9×80 y paleta). Verificación realizada: **40/40** comprobaciones E2E de Auth + PostgREST, **7/7** del cliente SSR con cookies y **33/33** de Zod; RLS y advisors sin hallazgos.

| Tabla | Contenido |
|---|---|
| `profiles` | Datos del alumno. La fila la crea un trigger al registrarse en Auth. |
| `subjects` | Asignaturas del alumno: nombre, código único, nivel 1–6 y color de la paleta. |
| `schedule_blocks` | Bloques del horario: día 1–6, módulo 1–9 y duración 1–9. |

Reglas que impone la base, no solo la aplicación: RLS por `auth.uid()`, código único por alumno, bloques dentro de la jornada, colores de la paleta cerrada y prohibición de solapamientos (incluso con bloques de varios módulos).

### Aplicar las migraciones

Con la CLI de Supabase y Docker:

```bash
npx supabase start
npx supabase db reset        # aplica migraciones + seed
npx supabase test db         # pruebas pgTAP de RLS
```

Contra un proyecto en la nube, sin Docker: vincula el proyecto y empuja las migraciones.

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

También puedes pegar el contenido de la migración en el SQL Editor del dashboard.

### Regenerar los tipos

`src/lib/supabase/database.types.ts` ya fue generado desde el proyecto real con `generate_typescript_types`. Regénéralo cada vez que cambie el esquema:

```bash
npx supabase gen types typescript --project-id ceibrnyeznqqsnkslmpw > src/lib/supabase/database.types.ts
```

### Rutas y sesión

La lógica de sesión está en `src/server/supabase/middleware.ts` y las Server Actions validan la sesión en el servidor. El `middleware.ts` de la raíz se activa en la Fase 5, junto con `/login` y `/registro`, para no redirigir la demo actual de `/horario` a una ruta que todavía no existe.

Contrato completo (firmas, errores y constantes): [`context/contracts.md`](./context/contracts.md).
