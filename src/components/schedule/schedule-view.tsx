"use client";

import { useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { toPng } from "html-to-image";
import { Download, Loader2, PanelLeft, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptySchedule } from "@/components/schedule/empty-schedule";
import { ScheduleGrid } from "@/components/schedule/schedule-grid";
import { SubjectCard } from "@/components/schedule/subject-card";
import { SubjectsPanel } from "@/components/schedule/subjects-panel";
import { dayLabel, normalizeBlocks } from "@/lib/schedule/blocks";
import type { DayOfWeek, Schedule, ScheduleBlock } from "@/lib/types/domain";

function isoWeek(date: Date): { year: number; week: number } {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);

  return { year: target.getUTCFullYear(), week };
}

const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  return pointerCollisions.length > 0 ? pointerCollisions : closestCenter(args);
};

interface ActiveDrag {
  block: ScheduleBlock;
  width: number;
  height: number;
}

export function ScheduleView({ subjects, blocks: initialBlocks }: Schedule) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(() => normalizeBlocks(initialBlocks));
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const activeSubject = activeDrag
    ? subjects.find((subject) => subject.id === activeDrag.block.subjectId)
    : undefined;

  function handleDragStart(event: DragStartEvent) {
    const block = blocks.find((item) => item.id === event.active.id);
    if (!block) return;

    // `active.rect.current.initial` todavía es null en este punto: el overlay
    // quedaría en 0×0 y la tarjeta se vería cortada. Medimos la tarjeta real.
    const target = event.activatorEvent.target;
    const node = target instanceof Element ? target.closest<HTMLElement>("[data-block-id]") : null;
    const rect = event.active.rect.current.initial;

    setActiveDrag({
      block,
      width: node?.offsetWidth ?? rect?.width ?? 0,
      height: node?.offsetHeight ?? rect?.height ?? 0,
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDrag(null);

    const target = over?.data.current as { dayOfWeek: DayOfWeek; moduleIndex: number } | undefined;
    if (!target) return;

    const moving = blocks.find((block) => block.id === active.id);
    if (!moving) return;

    const sameCell =
      moving.dayOfWeek === target.dayOfWeek && moving.moduleIndex === target.moduleIndex;
    if (sameCell) return;

    const occupied = blocks.some(
      (block) =>
        block.id !== moving.id &&
        block.dayOfWeek === target.dayOfWeek &&
        block.moduleIndex === target.moduleIndex,
    );

    if (occupied) {
      toast.error("Ese módulo ya está ocupado.");
      return;
    }

    setBlocks((previous) =>
      previous.map((block) =>
        block.id === moving.id
          ? { ...block, dayOfWeek: target.dayOfWeek, moduleIndex: target.moduleIndex }
          : block,
      ),
    );
  }

  async function handleExport() {
    const node = exportRef.current;
    if (!node || isExporting) return;

    setIsExporting(true);

    try {
      const background = getComputedStyle(node).backgroundColor;
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: background && background !== "rgba(0, 0, 0, 0)" ? background : "#ffffff",
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
          <p className="text-muted-foreground text-xs">
            9 módulos · mantén presionada una tarjeta para moverla
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

        <div ref={exportRef} className="bg-background min-w-0 flex-1">
          {blocks.length > 0 ? (
            <DndContext
              id="horario-semanal"
              sensors={sensors}
              collisionDetection={collisionDetection}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setActiveDrag(null)}
              accessibility={{
                announcements: {
                  onDragStart: ({ active }) =>
                    `Levantaste ${active.data.current?.subject?.name ?? "una asignatura"}. Usa las flechas para moverla y Enter para soltarla.`,
                  onDragOver: ({ active, over }) =>
                    over
                      ? `${active.data.current?.subject?.name ?? "Asignatura"} sobre ${dayLabel(over.data.current?.dayOfWeek)}, módulo ${over.data.current?.moduleIndex}.`
                      : undefined,
                  onDragEnd: ({ active, over }) =>
                    over
                      ? `${active.data.current?.subject?.name ?? "Asignatura"} movida.`
                      : `${active.data.current?.subject?.name ?? "Asignatura"} devuelta a su lugar.`,
                  onDragCancel: () => "Movimiento cancelado.",
                },
              }}
            >
              <ScheduleGrid
                subjects={subjects}
                blocks={blocks}
                isDragging={activeDrag != null}
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

              <DragOverlay
                dropAnimation={{ duration: 220, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                style={
                  activeDrag ? { width: activeDrag.width, height: activeDrag.height } : undefined
                }
              >
                {activeDrag && activeSubject ? (
                  <div className="schedule-drag-lift h-full w-full origin-center rounded-[3px] shadow-2xl shadow-black/30">
                    <SubjectCard subject={activeSubject} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <EmptySchedule />
          )}
        </div>
      </div>

      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="bg-background w-[min(20rem,85vw)] gap-0 p-0 sm:max-w-[20rem]"
        >
          <SheetHeader className="flex-row items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <SheetTitle>Asignaturas</SheetTitle>
              <Badge variant="secondary">{subjects.length}</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Cerrar"
              onClick={() => setIsPanelOpen(false)}
            >
              <X aria-hidden />
            </Button>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <SubjectsPanel subjects={subjects} showHeading={false} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
