"use client";

import { motion } from "framer-motion";
import { fadeUp, getMotionProps, getTransition, useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

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
  const reduced = useReducedMotion();
  const motionProps = getMotionProps(reduced);

  return (
    <motion.div
      variants={fadeUp}
      transition={{ ...getTransition(reduced), delay: reduced ? 0 : delay }}
      {...motionProps}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
