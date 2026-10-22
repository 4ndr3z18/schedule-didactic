# AGENTS.md - Directrices de Desarrollo (UsachSchedule)

Este documento define las reglas técnicas, arquitectónicas y de calidad obligatorias para el desarrollo y mantenimiento del proyecto **UsachSchedule**.

---

## Punto de entrada para un agente nuevo

Si eres un agente de IA y es la primera vez que abres este repositorio: **no tienes contexto previo de la conversación donde se tomaron estas decisiones**. Todo lo necesario está escrito en el repo. No preguntes al usuario algo que ya está resuelto aquí.

### Quiénes trabajan en este proyecto

| Persona | GitHub | Rama personal | Es dueña de |
|---|---|---|---|
| Sebastián | `s3b4s19` | `sebastian` | `supabase/`, `src/lib/supabase/`, `src/app/(auth)/` |
| Andrés | `4ndr3z18` | `andrez` | `src/components/schedule/`, `src/app/(app)/horario/` |

Las carpetas compartidas (`src/components/ui/`, `AGENTS.md`) se modifican por consenso, avisando en el Pull Request.

### Lectura obligatoria, en este orden

1. `AGENTS.md` (este archivo): stack, estilo, arquitectura y Definition of Done.
2. `MEMORY.md`: estado compartido. Máximo 50 palabras, es un resumen, no un historial.
3. `docs/decisions.md`: qué se decidió y por qué. **No reabras una decisión sin un argumento nuevo**; si lo tienes, propón un ADR que la sustituya.
4. `MEMORY.local.md` si existe: estado personal del humano que te está invocando.
5. `README.md`: cómo se levanta el proyecto y dónde está cada cosa.

### Cómo trabajar sin pisar al compañero

- `git pull --rebase origin main` antes de empezar y antes de cada push.
- Trabaja solo en la rama personal del humano que te invocó. Nunca commitees en `main`.
- No modifiques las carpetas del otro sin avisarlo en el Pull Request.
- Si lo que pide el humano contradice este documento, gana `AGENTS.md`: adviérselo antes de escribir código.

### Cómo comunicarte con la otra IA

Entre sesiones no hay memoria compartida: **lo que no quede escrito en el repo o en un PR no existe para la otra IA**. Al cerrar cada tarea:

1. Actualiza `MEMORY.local.md` con tu estado.
2. Actualiza `MEMORY.md` solo si el compañero necesita saberlo (≤50 palabras).
3. Si tomaste una decisión nueva, regístrala en `docs/decisions.md` con contexto, decisión y consecuencias.
4. Deja un comentario corto en el PR: qué tocaste, qué quedó pendiente y qué debe hacer la otra persona.

---

## 0. Gestión de Memoria y Contexto Compartido

El proyecto lo desarrollan **dos personas en paralelo, cada una con su propio agente de IA**. El contexto se reparte en tres archivos con responsabilidades distintas. No mezclar sus propósitos.

| Archivo | Versionado | Quién escribe | Contenido |
|---|---|---|---|
| `AGENTS.md` | Sí | Ambos, por consenso | Contrato técnico: stack, estilo, arquitectura, DoD. |
| `MEMORY.md` | Sí | Ambos, al cerrar tarea | Estado y decisiones **compartidas** ya cerradas. |
| `MEMORY.local.md` | **No** (`.gitignore`) | Cada uno | Estado personal: rama activa, tarea en curso, pendientes propios. |
| `docs/decisions.md` | Sí | Ambos | Log de decisiones (ADR) con su justificación. |

- **Lectura Obligatoria:** Al iniciar cualquier sesión, el agente debe leer `AGENTS.md`, `MEMORY.md` y, si existe, `MEMORY.local.md`; además consultar `docs/decisions.md` antes de proponer cambios de stack o de modelo de datos.
- **Actualización Dinámica:** Al finalizar una tarea, actualizar `MEMORY.local.md` siempre y `MEMORY.md` solo si la decisión afecta al compañero.
- **Límite y Concisión:** `MEMORY.md` tiene un límite estricto de **máximo 50 palabras** en total. Lo que no cabe ahí va a `docs/decisions.md`.
- **Regla de verdad:** la versión de `AGENTS.md` y `MEMORY.md` en `main` es la única autoritativa. Nunca leerlos desde una rama ajena.

---

## 1. Rol y Stack Tecnológico

- **Rol:** Desarrollador Full-Stack Senior especializado en aplicaciones web modernas, interactivas, accesibles y *responsive* con Next.js y Supabase.
- **Stack Tecnológico:**
  | Capa | Elección | Propósito en UsachSchedule |
  |---|---|---|
  | **Framework** | **Next.js** (App Router) | Server Components para datos de usuario y Server Actions para autenticación y mutaciones de horarios. |
  | **Lenguaje** | **TypeScript** (`strict: true`) | Tipado estricto para modelos de dominio (asignaturas, bloques horarios, usuarios). |
  | **Estilos** | **Tailwind CSS** | Diseño responsivo, componentes compartidos y sistema de diseño adaptado al formato USACH. |
  | **Componentes UI** | **shadcn/ui** (Radix Primitives) | Primitivas accesibles (diálogos, menús desplegables, tarjetas interactivas). |
  | **Base de Datos & Auth** | **Supabase** (Postgres + Auth) | Almacenamiento relacional de usuarios, asignaturas y horarios con Row Level Security (RLS). |
  | **Validación** | **Zod** | Esquemas de validación unificados en cliente y servidor para asignaturas y credenciales. |
  | **Formularios** | **React Hook Form** + Resolvers | Gestión eficiente de formularios de login y edición de tarjetas de asignaturas. |
  | **Iconografía** | **lucide-react** | Iconos vectoriales minimalistas (sin fuentes externas ni emojis). |
| **Drag & Drop** | **@dnd-kit** | Sensores con activación por pulsación prolongada: soporte táctil real y accesibilidad por teclado. |

---

## 2. Guía de Estilo Visual y Tono

- **Paleta de Colores:** Tonos corporativos sobrios acordes a la identidad institucional (neutros limpios con acentos formales).
- **Iconografía y Emojis:** 
  * **Prohibido el uso de emojis** en la interfaz o código.
  * Usar exclusivamente iconos vectoriales de `lucide-react`.
- **Tipografía:** Fuentes sans-serif limpias y legibles del sistema (ej. Inter).

---

## 3. Arquitectura y Estándares de Código

### Componentes y Estado
- Separar claramente **Server Components** (para obtención inicial de datos y seguridad) y **Client Components** (`'use client'`) para interactividad avanzada (drag-and-drop de horarios, menús desplegables, estados de carga).
- Implementar **skeletons** y barras de carga nativas de shadcn/ui o Tailwind durante la obtención de datos asíncronos desde Supabase.

### Interactividad y Drag-and-Drop
- Asegurar soporte táctil y de escritorio para el sistema de tarjetas de asignaturas y su colocación en los bloques del calendario semanal formato USACH.
- Implementar zona de eliminación interactiva (botón de papelera con activación por mantenimiento/pulsación prolongada o gesto dedicado).
- Permitir la edición dinámica de las tarjetas una vez ubicadas en el calendario (modificar nombre, código y nivel con validación Zod).

### Seguridad y Base de Datos
- Proteger todas las rutas y Server Actions verificando la sesión activa mediante Supabase Auth.
- Configurar políticas RLS en Supabase para garantizar que cada alumno solo edite y visualice sus propios horarios y asignaturas personalizadas.

---

## 4. Criterios de Aceptación (Definition of Done)

Un cambio está completo únicamente si:
1. Compila sin errores de TypeScript (`strict: true`) ni advertencias de linter.
2. Es completamente *responsive* (adaptado a dispositivos móviles con menú lateral desplegable y escritorio).
3. Implementa correctamente estados de carga (*skeletons*) y manejo de errores defensivo.
4. Las interacciones táctiles de arrastrar y soltar funcionan con fluidez tanto en móvil como en PC.
5. Respeta la estructura de Supabase y las políticas de seguridad RLS establecidas.

---

## 5. Trabajo en Equipo y Control de Versiones

### Ramas
- `main` es la **única fuente autoritativa**: `AGENTS.md`, `MEMORY.md`, esquema SQL y configuración viven ahí.
- Cada persona trabaja en su rama personal (`sebastian`, `andrez`). Prohibido commitear directo a `main`.
- `main` avanza solo por Pull Request desde una rama personal, con revisión del compañero.
- Antes de empezar cualquier tarea: `git pull --rebase origin main`. Antes de cada push: rebase sobre `main`.

### Propiedad del código (evitar conflictos)
Cada carpeta tiene **un solo dueño** en cada momento. La asignación está en la tabla de "Punto de entrada para un agente nuevo". Si hay que tocar la carpeta del otro, se avisa primero en el PR.

### Commits
- Formato Conventional Commits en español: `feat(horario): ...`, `fix(auth): ...`, `docs(memory): ...`, `chore(deps): ...`.
- Un commit = un cambio lógico. No mezclar refactor con feature.
- Prohibido commitear `.env.local`, `MEMORY.local.md`, `node_modules`, claves `sb_secret_` o cualquier credencial. Las claves del cliente van en variables `NEXT_PUBLIC_*`; la `service_role` **nunca** toca el navegador.

### Memoria compartida al cerrar tarea
1. Actualizar `MEMORY.local.md` (estado personal).
2. Actualizar `MEMORY.md` **solo** con lo que el compañero necesita saber, respetando las 50 palabras.
3. Registrar la decisión y su motivo en `docs/decisions.md`.
4. Commit `docs(memory): ...` en la rama personal y push.

### Regla anti-deriva entre IAs
Si dos agentes proponen cosas distintas (librería, nombre de tabla, formato de fecha), **gana lo escrito en `main`**. Si no está escrito, se escribe la decisión en `docs/decisions.md` antes de implementarla.