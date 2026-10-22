import { CalendarOff } from "lucide-react";

export function EmptySchedule() {
  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card/40 px-6 py-12 text-center">
      <CalendarOff aria-hidden className="size-8 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Tu horario está vacío</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Agrega una asignatura y arrástrala a un módulo para empezar a armar tu semana.
        </p>
      </div>
    </div>
  );
}
