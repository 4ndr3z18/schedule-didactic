# CLAUDE.md

Este proyecto define sus reglas en [`AGENTS.md`](./AGENTS.md). **Léelo completo antes de escribir código**, empezando por la sección "Punto de entrada para un agente nuevo".

Resumen mínimo:

1. Lee en orden: `AGENTS.md` → `MEMORY.md` → `docs/decisions.md` → `MEMORY.local.md` (si existe) → `README.md`.
2. Trabaja solo en la rama personal del humano que te invocó (`sebastian` o `andrez`). Nunca en `main`.
3. `git pull --rebase origin main` antes de empezar.
4. No toques `MEMORY.md` (límite de 50 palabras) ni las carpetas del otro desarrollador sin avisar en el PR.
5. Al cerrar la tarea: actualiza `MEMORY.local.md`, registra decisiones nuevas en `docs/decisions.md` y comenta el PR con lo pendiente.
