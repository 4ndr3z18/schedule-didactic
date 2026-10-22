import { Skeleton } from "@/components/ui/skeleton";

export function ScheduleSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-64" />
      </div>

      <div className="flex gap-6">
        <div className="hidden w-64 shrink-0 flex-col gap-2 lg:flex">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden rounded-lg border">
          <div className="grid min-w-[49.625rem] grid-cols-[4.25rem_repeat(6,minmax(7.5rem,1fr))]">
            <Skeleton className="h-[2.375rem] rounded-none border-r border-b" />
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[2.375rem] rounded-none border-r border-b" />
            ))}
            {Array.from({ length: 54 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-[var(--schedule-row-h)] rounded-none border-r border-b"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
