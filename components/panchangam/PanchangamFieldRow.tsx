import { cn } from "@/lib/utils";

interface PanchangamFieldRowProps {
  label: string;
  value: string;
  className?: string;
}

export function PanchangamFieldRow({
  label,
  value,
  className,
}: PanchangamFieldRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-2.5 border-b border-border/60 last:border-0",
        className
      )}
    >
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}
