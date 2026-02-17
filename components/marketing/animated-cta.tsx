"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedCtaProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  size?: "default" | "lg";
  showArrow?: boolean;
  className?: string;
}

export function AnimatedCta({
  href,
  children,
  variant = "primary",
  size = "default",
  showArrow = true,
  className,
}: AnimatedCtaProps) {
  const isPrimary = variant === "primary";
  return (
    <motion.span
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Link
        href={href}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          size === "lg" && "h-12 px-8 text-base",
          size === "default" && "h-10 px-4 text-sm",
          isPrimary &&
            "bg-brand-green text-black hover:bg-brand-green-light shadow-lg shadow-brand-green/20",
          !isPrimary &&
            "border border-border bg-transparent hover:bg-surface hover:border-brand-green/50 hover:text-text-primary",
          className
        )}
      >
        {children}
        {showArrow && (
          <motion.span
            initial={false}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="inline-flex"
          >
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.span>
        )}
      </Link>
    </motion.span>
  );
}
