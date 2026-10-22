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
        "flex h-full w-full flex-col overflow-hidden rounded-md border px-1.5 py-0.5 text-center",
        "transition-[box-shadow] duration-150 ease-out",
        "hover:shadow-md hover:shadow-black/10",
        className,
      )}
      style={{
        backgroundColor: color.background,
        borderColor: color.border,
        color: "#FFFFFF",
      }}
    >
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <span className="line-clamp-2 text-[10px] leading-[1.15] font-semibold break-words">
          {subject.name}
        </span>
      </div>
      <span className="mt-0.5 min-h-[9px] shrink-0 text-[9px] leading-none font-medium tracking-[0.02em]">
        {subject.code}
      </span>
    </div>
  );
}
