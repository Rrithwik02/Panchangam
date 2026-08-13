"use client";

import { ScrollReveal } from "@/components/ScrollReveal";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
}: AnimatedSectionProps) {
  return (
    <ScrollReveal className={className} delay={delay}>
      {children}
    </ScrollReveal>
  );
}
