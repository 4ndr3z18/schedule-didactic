# Contratos — Frontend / Backend

Documento puente entre las dos mitades del proyecto. **Lo mantiene el backend (Andrés)**; el frontend lo consume. Cualquier cambio se avisa en el PR antes de aplicarlo, porque rompe tipos en ambos lados.

Estado: **plantilla**. Se completa al inicio de la Fase 2.

---

## 1. Constantes de la jornada

Confirmadas en ADR-004. El frontend las tiene en `src/lib/schedule/constants.ts`; deben coincidir.

| Constante | Valor |
|---|---|
| `TOTAL_MODULES` | 9 |
| `MODULE_MINUTES` | 80 |
| `INCLUDE_SATURDAY` | sí |
| `DAYS` | lunes a sábado |

| Módulo | Inicio | Fin |
|---|---|---|
| 1 | 08:15 | 09:35 |
| 2 | 09:50 | 11:10 |
| 3 | 11:25 | 12:45 |
| 4 | 13:45 | 15:05 |
| 5 | 15:20 | 16:40 |
| 6 | 16:55 | 18:15 |
| 7 | 18:45 | 20:05 |
| 8 | 20:05 | 21:25 |
| 9 | 21:25 | 22:45 |

## 2. Tipos de dominio

Viven en `src/lib/types/domain.ts` y deben coincidir con la base de datos.

```ts
type Level = number; // nivel o semestre de la asignatura

interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string;
  level: Level;
  color: string;
  createdAt: string;
}

interface ScheduleBlock {
  id: string;
  userId: string;
  subjectId: string;
  dayOfWeek: number;   // 1 lunes ... 6 sábado
  moduleIndex: number; // 1..TOTAL_MODULES
  duration: number;    // módulos consecutivos que ocupa
}
```

## 3. Server Actions

Todas viven en `src/server/actions/` y devuelven el mismo formato:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string[]> }; // campo -> mensajes
```

| Acción | Archivo | Entrada | Salida | Errores esperados |
|---|---|---|---|---|
| `login` | `auth.ts` | `email`, `password` | `void` | credenciales inválidas, email no confirmado |
| `register` | `auth.ts` | `email`, `password`, `fullName` | `void` | email ya registrado, contraseña débil |
| `logout` | `auth.ts` | — | `void` | — |
| `createSubject` | `subjects.ts` | `name`, `code`, `level`, `color` | `Subject` | código duplicado, límite de asignaturas |
| `updateSubject` | `subjects.ts` | `id` + campos editables | `Subject` | no encontrada, sin permisos |
| `deleteSubject` | `subjects.ts` | `id` | `void` | no encontrada, sin permisos |
| `placeBlock` | `blocks.ts` | `subjectId`, `dayOfWeek`, `moduleIndex` | `ScheduleBlock` | bloque ocupado, módulo fuera de rango |
| `moveBlock` | `blocks.ts` | `id`, `dayOfWeek`, `moduleIndex` | `ScheduleBlock` | bloque ocupado, sin permisos |
| `removeBlock` | `blocks.ts` | `id` | `void` | no encontrado, sin permisos |
| `getSchedule` | `schedule.ts` | — | `{ subjects: Subject[]; blocks: ScheduleBlock[] }` | sin sesión |

## 4. Reglas que el frontend puede asumir

- Toda acción valida la sesión en el servidor. La UI no decide permisos.
- La UI nunca ve mensajes de Postgres: solo el mapa `campo -> mensajes` en español.
- Un bloque ocupado se rechaza en el servidor, no solo en el drag & drop.
- Después de cada mutación, el servidor revalida la ruta del horario; el frontend no manipula el estado global como fuente de verdad.

## 5. Pendiente de definir

- Si un ramo de varios módulos consecutivos se guarda como un bloque con `duration` o como varios bloques independientes. El frontend asume `duration`.
- Paleta de colores permitida para las asignaturas.
- Formato de exportación: PNG de la semana generado en el cliente.
