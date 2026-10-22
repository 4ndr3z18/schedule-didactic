# AGENTS.md — Punto de entrada

Este repositorio separa **contexto** de **código**. La raíz solo contiene configuración y este puntero; todo el contexto del proyecto vive en `context/`.

## Antes de escribir una línea de código

Lee, en este orden:

1. `context/AGENTS.md` — contrato técnico y de trabajo. **Obligatorio.**
2. `context/roadmap.md` — qué se construye, en qué orden y quién hace cada parte.
3. `context/contracts.md` — tipos, constantes de la jornada y firmas de las Server Actions.
4. `context/MEMORY.md` — estado compartido (máximo 50 palabras).
5. `context/decisions.md` — ADRs: no reabras una decisión aceptada sin un argumento nuevo.
6. `context/MEMORY.local.md` — estado personal del humano que te invocó, si existe.
7. `README.md` — cómo se levanta el proyecto.

## Reglas que no se negocian

- `main` es la única fuente autoritativa. Se trabaja en `sebastian` o `andrez` y se integra por Pull Request.
- Frontera por carpeta: todo `src/server/**` es backend (Andrés); `src/app/` y `src/components/` son frontend (Sebastián).
- Nunca commitear `.env.local`, `context/MEMORY.local.md`, `node_modules` ni credenciales.
- Si algo no está escrito en `context/`, no lo inventes: escríbelo primero en `context/decisions.md`.

## Mapa de la raíz

```
AGENTS.md                 Este puntero.
README.md                 Presentación del producto y puesta en marcha.
context/                  Todo el contexto del proyecto. Ver orden de lectura arriba.
.env.example              Variables de entorno requeridas.
.gitignore
```

La estructura de `context/` y las reglas completas están en `context/AGENTS.md`.
