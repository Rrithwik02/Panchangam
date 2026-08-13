import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationBadgeProps {
  location: string;
  className?: string;
}

export function LocationBadge({ location, className }: LocationBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card-muted px-3 py-1 text-metadata text-muted",
        className
      )}
    >
      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
      {location}
    </span>
  );
}
