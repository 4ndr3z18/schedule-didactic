import { Suspense } from "react";
import type { Metadata } from "next";

import { ScheduleSkeleton } from "@/components/schedule/schedule-skeleton";
import { ScheduleView } from "@/components/schedule/schedule-view";
import { getMockSchedule } from "@/lib/schedule/mock-data";

export const metadata: Metadata = {
  title: "Horario semanal",
};

async function ScheduleData() {
  // Fase 5: reemplazar por getSchedule() de src/server/actions/schedule.ts.
  const { subjects, blocks } = getMockSchedule();

  return <ScheduleView subjects={subjects} blocks={blocks} />;
}

export default function HorarioPage() {
  return (
    <Suspense fallback={<ScheduleSkeleton />}>
      <ScheduleData />
    </Suspense>
  );
}
