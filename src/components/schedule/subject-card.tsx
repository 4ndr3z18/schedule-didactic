import { cn } from "@/lib/utils";
import { getSubjectColor } from "@/lib/schedule/palette";
import type { Subject } from "@/lib/types/domain";

interface SubjectCardProps {
  subject: Subject;
  duration: number;
  className?: string;
}

export function SubjectCard({ subject, duration, className }: SubjectCardProps) {
  const color = getSubjectColor(subject.color);

  return (
    <div
      title={`${subject.name} · ${subject.code} · Nivel ${subject.level}`}
      data-testid="subject-card"
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-0.5 overflow-hidden rounded-[3px] border px-1.5 py-1 text-center leading-tight",
        className,
      )}
      style={{
        backgroundColor: color.background,
        borderColor: color.border,
        color: color.foreground,
      }}
    >
      <span
        className={cn(
          "line-clamp-2 font-medium",
          duration > 1 ? "text-xs" : "text-[11px]",
        )}
      >
        {subject.name}
      </span>
      <span className="text-[10px] tabular-nums opacity-90">
        {subject.code} · Nv {subject.level}
      </span>
      {duration > 1 ? (
        <span className="text-[9px] tracking-wide uppercase opacity-80">
          {duration} módulos
        </span>
      ) : null}
    </div>
  );
}
