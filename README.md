# UsachSchedule

Planificador de horario académico para estudiantes de la Universidad de Santiago de Chile. Permite construir el horario semanal arrastrando tarjetas de asignaturas sobre una grilla de módulos, en escritorio y en móvil.

Repository name: `schedule-didactic`.

---

## Estado

Fase 0. El repositorio contiene únicamente la definición del proyecto y las convenciones de trabajo. La aplicación Next.js aún no está inicializada.

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
AGENTS.md            Contrato técnico del proyecto (obligatorio para agentes).
MEMORY.md            Estado compartido y acotado (máximo 50 palabras).
MEMORY.local.md      Estado personal de cada desarrollador. Ignorado por git.
docs/decisions.md    Registro de decisiones (ADR) con su justificación.
```

## Trabajo en equipo

Dos desarrolladores, cada uno con su propio agente. Reglas completas en [`AGENTS.md`](./AGENTS.md): sección "Punto de entrada para un agente nuevo" y sección 5.

1. `git pull --rebase origin main` antes de empezar.
2. Trabajar en la rama personal (`sebastian`, `andrez`). Nunca commitear directo a `main`.
3. Integrar por Pull Request con revisión del compañero.
4. Al cerrar la tarea actualizar `MEMORY.local.md`, `MEMORY.md` (si afecta al compañero) y `docs/decisions.md`.
5. Copiar `MEMORY.local.md` como plantilla propia si no existe; está en `.gitignore`.

Los agentes que no leen `AGENTS.md` por convención tienen puntos de entrada alternativos: [`CLAUDE.md`](./CLAUDE.md) y [`.github/copilot-instructions.md`](./.github/copilot-instructions.md). Todos apuntan a `AGENTS.md`, que es la única fuente de verdad.

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
