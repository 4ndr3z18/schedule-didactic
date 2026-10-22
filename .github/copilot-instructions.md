# Instrucciones para GitHub Copilot

Las reglas del proyecto están en [`AGENTS.md`](../../AGENTS.md). Léelo completo antes de sugerir código, empezando por la sección "Punto de entrada para un agente nuevo".

Puntos que no se negocian:

- Stack: Next.js (App Router), TypeScript `strict`, Tailwind, shadcn/ui, Supabase con RLS, Zod, React Hook Form, `@dnd-kit`, `lucide-react`.
- Sin emojis en interfaz ni código. Iconos solo de `lucide-react`.
- Server Components por defecto; `'use client'` solo para interactividad.
- Toda tabla de Supabase lleva RLS con `auth.uid() = user_id`.
- Nunca sugieras la `service_role` key en código de cliente.
- Trabajo en ramas personales; `main` solo recibe Pull Requests.
