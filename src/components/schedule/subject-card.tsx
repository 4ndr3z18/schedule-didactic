import { cn } from "@/lib/utils";
import { getSubjectColor } from "@/lib/schedule/palette";
import type { Subject } from "@/lib/types/domain";

interface SubjectCardProps {
  subject: Subject;
  className?: string;
}

export function SubjectCard({ subject, className }: SubjectCardProps) {
  const color = getSubjectColor(subject.color);

  return (
    <div
      title={`${subject.name} · ${subject.code}`}
      data-testid="subject-card"
      className={cn(
        "grid h-full w-full grid-rows-[minmax(0,1fr)_auto] gap-0.5 overflow-hidden rounded-[3px] border px-1 py-0.5 text-center",
        "transition-[transform,box-shadow] duration-150 ease-out",
        "hover:-translate-y-px hover:shadow-md hover:shadow-black/10",
        className,
      )}
      style={{
        backgroundColor: color.background,
        borderColor: color.border,
        color: "#FFFFFF",
      }}
    >
      <div className="flex min-h-0 items-center justify-center overflow-hidden">
        <span className="line-clamp-2 text-[10px] leading-[1.1] font-semibold break-words">
          {subject.name}
        </span>
      </div>
      <span className="text-[9px] leading-none font-medium tracking-[0.02em]">
        {subject.code}
      </span>
    </div>
  );
}
