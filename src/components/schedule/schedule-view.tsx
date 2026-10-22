"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2, PanelLeft, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptySchedule } from "@/components/schedule/empty-schedule";
import { ScheduleGrid } from "@/components/schedule/schedule-grid";
import { SubjectsPanel } from "@/components/schedule/subjects-panel";
import type { Schedule } from "@/lib/types/domain";

function isoWeek(date: Date): { year: number; week: number } {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);

  return { year: target.getUTCFullYear(), week };
}

export function ScheduleView({ subjects, blocks }: Schedule) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  async function handleExport() {
    const node = exportRef.current;
    if (!node || isExporting) return;

    setIsExporting(true);

    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
        filter: (element) =>
          !(element instanceof HTMLElement && element.dataset.exportExclude === "true"),
      });

      const { year, week } = isoWeek(new Date());
      const link = document.createElement("a");
      link.download = `horario-usach-${year}-s${String(week).padStart(2, "0")}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Imagen del horario descargada.");
    } catch {
      toast.error("No se pudo generar la imagen. Inténtalo otra vez.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold tracking-tight">Horario semanal</h1>
          <p className="text-xs text-muted-foreground">
            9 módulos de 80 minutos · lunes a sábado
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setIsPanelOpen(true)}
        >
          <PanelLeft aria-hidden />
          Asignaturas
        </Button>
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <SubjectsPanel subjects={subjects} />
        </aside>

        <div ref={exportRef} className="min-w-0 flex-1 bg-background">
          {blocks.length > 0 ? (
            <ScheduleGrid
              subjects={subjects}
              blocks={blocks}
              cornerSlot={
                <span data-export-exclude="true">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleExport}
                    disabled={isExporting}
                    aria-label="Descargar imagen del horario"
                    title="Descargar imagen del horario"
                  >
                    {isExporting ? (
                      <Loader2 aria-hidden className="animate-spin" />
                    ) : (
                      <Download aria-hidden />
                    )}
                  </Button>
                </span>
              }
            />
          ) : (
            <EmptySchedule />
          )}
        </div>
      </div>

      {isPanelOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Asignaturas"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setIsPanelOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col gap-3 overflow-y-auto border-r bg-background p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Asignaturas</span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Cerrar"
                onClick={() => setIsPanelOpen(false)}
              >
                <X aria-hidden />
              </Button>
            </div>
            <SubjectsPanel subjects={subjects} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
