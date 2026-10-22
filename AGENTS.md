# AGENTS.md — Directrices de Desarrollo (UsachSchedule)

Contrato técnico y de trabajo del proyecto **UsachSchedule**. OpenCode carga este archivo automáticamente al iniciar una sesión en este repositorio: es el punto de partida de cualquier agente que trabaje aquí.

---

## Punto de entrada

Si es tu primera sesión en este repositorio, **no tienes el contexto de las conversaciones anteriores**. Todo lo necesario está escrito acá y en los documentos enlazados. No preguntes al usuario algo que ya está resuelto: búscalo primero.

### Quiénes trabajan acá

| Persona | GitHub | Rama | Es dueña de |
|---|---|---|---|
| Sebastián | `s3b4s19` | `sebastian` | `supabase/`, `src/lib/supabase/`, `src/app/(auth)/` |
| Andrés | `4ndr3z18` | `andrez` | `src/components/schedule/`, `src/app/(app)/horario/` |

Compartidas, se modifican por consenso y avisando en el PR: `src/components/ui/`, `AGENTS.md`, `MEMORY.md` y `docs/`.

### Orden de lectura

1. **`AGENTS.md`** (este archivo): reglas técnicas, de estilo y de trabajo.
2. **`docs/roadmap.md`**: qué se construye, en qué orden y quién hace cada parte.
3. **`MEMORY.md`**: estado compartido del proyecto (máximo 50 palabras).
4. **`docs/decisions.md`**: qué se decidió y por qué. **No reabras una decisión sin un argumento nuevo**; si lo tienes, propón un ADR que la sustituya.
5. **`MEMORY.local.md`**: estado personal del humano que te invocó, si existe.
6. **`README.md`**: cómo se levanta el proyecto y dónde está cada cosa.

### Antes de la primera línea de código

- `git pull --rebase origin main`.
- Confirma la rama: debe ser la del humano que te invocó, nunca `main`.
- Si la tarea toca una carpeta del otro, avísalo en el issue o PR antes de empezar.
- Si la tarea depende de un ADR en estado `Propuesta`, no inventes el modelo de datos: pregunta o espera.

### Comunicación entre agentes

No hay memoria compartida entre sesiones ni entre las dos IAs: **lo que no quede escrito en el repo o en un PR no existe para la otra IA**. Al cerrar una tarea:

1. `MEMORY.local.md`: tu estado personal. No se commitea.
2. `MEMORY.md`: solo lo que el compañero necesita saber, respetando las 50 palabras.
3. `docs/decisions.md`: toda decisión nueva, con contexto, decisión y consecuencias.
4. Comentario en el PR: qué tocaste, qué quedó pendiente y qué debe hacer la otra persona.

---

## 0. Memoria y Contexto Compartido

| Archivo | Versionado | Quién escribe | Contenido |
|---|---|---|---|
| `AGENTS.md` | Sí | Ambos, por consenso | Contrato técnico y de trabajo. |
| `MEMORY.md` | Sí | Ambos, al cerrar tarea | Estado compartido. **Máximo 50 palabras.** |
| `MEMORY.local.md` | **No** (`.gitignore`) | Cada uno | Estado personal: rama, tarea en curso, pendientes. Se crea copiando `MEMORY.local.example.md`. |
| `docs/decisions.md` | Sí | Ambos | Decisiones (ADR) con su justificación. |
| `docs/roadmap.md` | Sí | Ambos | Fases, tareas, responsables y dependencias. |

- **Límite duro:** `MEMORY.md` no puede superar las 50 palabras. Lo que no cabe va a `docs/decisions.md` (el porqué) o a `docs/roadmap.md` (el qué viene).
- **Regla de verdad:** la versión de estos archivos en `main` es la única autoritativa. Nunca se leen desde una rama ajena.
- **Actualización:** al cerrar cada tarea, según el protocolo de "Comunicación entre agentes".

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
Cada carpeta tiene **un solo dueño** en cada momento. La asignación está en la tabla de "Punto de entrada". Si hay que tocar la carpeta del otro, se avisa primero en el PR.

### Commits
- Formato Conventional Commits en español: `feat(horario): ...`, `fix(auth): ...`, `docs(memory): ...`, `chore(deps): ...`.
- Un commit = un cambio lógico. No mezclar refactor con feature.
- Prohibido commitear `.env.local`, `MEMORY.local.md`, `node_modules`, claves `sb_secret_` o cualquier credencial. Las claves del cliente van en variables `NEXT_PUBLIC_*`; la `service_role` **nunca** toca el navegador.

### Memoria compartida al cerrar tarea
El protocolo completo está en "Comunicación entre agentes". En git, el cierre siempre deja un commit `docs(memory): ...` en la rama personal, y el PR actualizado con lo pendiente.

### Regla anti-deriva entre IAs
Si dos agentes proponen cosas distintas (librería, nombre de tabla, formato de fecha), **gana lo escrito en `main`**. Si no está escrito, se escribe la decisión en `docs/decisions.md` antes de implementarla.