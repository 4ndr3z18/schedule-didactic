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
          <div className="grid min-w-[62rem] grid-cols-[5rem_repeat(6,minmax(9rem,1fr))]">
            <Skeleton className="h-11 rounded-none border-r border-b" />
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-11 rounded-none border-r border-b" />
            ))}
            {Array.from({ length: 45 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-none border-r border-b" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
