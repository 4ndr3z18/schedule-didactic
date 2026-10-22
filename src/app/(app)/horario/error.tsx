"use client";

import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ScheduleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card/40 px-6 py-12 text-center">
      <TriangleAlert aria-hidden className="size-8 text-destructive" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">No se pudo cargar el horario</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Revisa tu conexión e inténtalo de nuevo.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
