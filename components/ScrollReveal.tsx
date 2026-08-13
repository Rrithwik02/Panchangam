"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 32,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;

      gsap.from(ref.current, {
        opacity: 0,
        y,
        duration: 0.7,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: ref, dependencies: [reduced, delay, y] }
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
