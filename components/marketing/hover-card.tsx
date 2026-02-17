"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
}

/** Card with lift + glow on hover — use for feature/project cards */
export function HoverCard({ children, className }: HoverCardProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-lg border border-border bg-surface text-text-primary transition-shadow",
        className
      )}
      whileHover={{
        y: -4,
        boxShadow: "0 20px 40px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(34, 197, 94, 0.15)",
        transition: { duration: 0.2 },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}
