# UsachSchedule

Planificador de horario académico para estudiantes de la Universidad de Santiago de Chile. Permite construir el horario semanal arrastrando tarjetas de asignaturas sobre una grilla de módulos, en escritorio y en móvil.

Repository name: `schedule-didactic`.

---

## Estado

Fase 0 completada: convenciones, reparto de trabajo y contratos definidos. Fase 2 (backend Supabase) escrita en la rama `andrez`; falta probarla contra un proyecto real. Siguiente en `main`: Fase 1 (scaffold de Next.js), ver [`context/roadmap.md`](./context/roadmap.md).

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
| Andrés | Backend | `supabase/`, `src/server/`, `src/lib/validation/`, `middleware.ts`. |

La frontera completa está en [`context/AGENTS.md` § 3](./context/AGENTS.md). El frontend consume Server Actions y tipos; nunca importa `src/server/supabase/*`. El puente entre ambos es [`context/contracts.md`](./context/contracts.md).

## Trabajo en equipo

Dos desarrolladores, cada uno con su propia sesión de OpenCode. Reglas completas en [`context/AGENTS.md`](./context/AGENTS.md), secciones "Punto de entrada" y "Trabajo en Equipo y Control de Versiones".

1. `git pull --rebase origin main` antes de empezar.
2. Trabajar en la rama personal (`sebastian`, `andrez`). Nunca commitear directo a `main`.
3. Integrar por Pull Request con revisión del compañero.
4. Al cerrar la tarea: actualizar `context/MEMORY.local.md`, `context/MEMORY.md` (si afecta al compañero) y `context/decisions.md`.
5. Si no tienes `context/MEMORY.local.md`, copia `context/MEMORY.local.example.md`; el archivo resultante queda fuera de git.

Qué construir y en qué orden: [`context/roadmap.md`](./context/roadmap.md).

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

El proyecto remoto tiene la confirmación de correo activada: al registrarse, Supabase responde sin sesión y la UI debe mostrar «revisa tu correo». En local, `supabase/config.toml` la desactiva para agilizar las pruebas.

## Backend (Supabase)

El esquema vive en `supabase/migrations/20261022061151_initial_schema.sql`. Proyecto remoto: **`schedule-didactic`** (`ceibrnyeznqqsnkslmpw`, `us-east-1`), con las dos migraciones aplicadas y el aislamiento RLS verificado con dos usuarios reales.

| Tabla | Contenido |
|---|---|
| `profiles` | Datos del alumno. La fila la crea un trigger al registrarse en Auth. |
| `subjects` | Asignaturas del alumno: nombre, código único, nivel 1–6 y color. |
| `schedule_blocks` | Bloques del horario: día 1–6, módulo 1–10 y duración. |

Reglas que impone la base, no solo la aplicación: RLS por `auth.uid()`, código único por alumno, bloques dentro de la jornada y prohibición de solapamientos (incluso con bloques de varios módulos).

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

`middleware.ts` refresca la sesión en cada request. Sin sesión, `/horario` redirige a `/login?redirectTo=...`; con sesión, `/login` y `/registro` redirigen a `/horario`.

### Estructura del backend

```
src/lib/constants/        Jornada (10 módulos × 90 min) y límites.
src/lib/types/            Tipos de dominio y ActionResult.
src/lib/validation/       Esquemas Zod compartidos con los formularios.
src/lib/supabase/         Tipos de la base y cliente de navegador.
src/server/supabase/      Cliente SSR y refresco de sesión.
src/server/actions/       login, register, logout, CRUD de asignaturas y bloques, getSchedule.
middleware.ts             Punto de entrada de Next.js.
```

Contrato completo (firmas, errores y constantes): [`context/contracts.md`](./context/contracts.md).
