"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Code2, Palette, Rocket, Smartphone, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  ShoppingBag,
  Code2,
  Palette,
  Rocket,
  Smartphone,
  Zap,
} as const;

interface FeatureCardProps {
  icon: keyof typeof iconMap;
  title: string;
  description: string;
  index: number;
}

export function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  const Icon = iconMap[icon];
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="h-full min-h-[260px]"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <motion.div
        className={cn(
          "h-full flex flex-col rounded-xl border-2 bg-surface overflow-hidden cursor-pointer select-none",
          "transition-colors duration-300",
          isHovered ? "border-brand-green/40 shadow-xl shadow-brand-green/5" : "border-border"
        )}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="p-6 flex flex-col flex-1 min-h-0">
          {/* Icon — animates on hover */}
          <motion.div
            className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center mb-5 shrink-0",
              "transition-colors duration-300",
              isHovered ? "bg-brand-green/30" : "bg-brand-green/20"
            )}
            animate={{
              scale: isHovered ? 1.08 : 1,
              rotate: isHovered ? 3 : 0,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Icon className="h-6 w-6 text-brand-green" />
          </motion.div>

          {/* Title */}
          <h3 className="text-lg font-medium text-text-primary mb-3 leading-tight">{title}</h3>

          {/* Description — fixed height for consistent card size */}
          <div className="flex-1 min-h-[4.5rem] overflow-hidden">
            <AnimatePresence mode="wait">
              {!isExpanded ? (
                <motion.p
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-text-secondary leading-relaxed line-clamp-3"
                >
                  {description}
                </motion.p>
              ) : (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="h-[4.5rem] overflow-y-auto pr-1"
                >
                  <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive hint */}
          <motion.div
            className="mt-4 flex items-center gap-2 text-xs font-medium text-brand-green/90"
            animate={{ opacity: isHovered ? 1 : 0.8 }}
          >
            <span>{isExpanded ? "Click to collapse" : "Click to expand"}</span>
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="inline-block"
            >
              ↓
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
