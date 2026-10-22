import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/30 flex min-h-dvh flex-col">
      <header className="bg-background/90 sticky top-0 z-50 border-b backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-4">
          <Link href="/horario" className="flex items-center gap-2 rounded-md">
            <CalendarDays aria-hidden className="size-5" />
            <span className="text-sm font-semibold tracking-tight">UsachSchedule</span>
          </Link>

          <span className="text-muted-foreground hidden text-xs sm:inline">
            Planificador semanal
          </span>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Badge variant="outline" className="text-[10px] font-normal">
              Datos de ejemplo
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-6">
        {children}
      </main>
    </div>
  );
}
