"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface InteractiveFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  details?: string;
}

export function InteractiveFeatureCard({ icon: Icon, title, description, details }: InteractiveFeatureCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="group relative rounded-lg border border-border bg-surface text-text-primary overflow-hidden cursor-pointer"
      onHoverStart={() => setExpanded(true)}
      onHoverEnd={() => setExpanded(false)}
      whileHover={{
        y: -4,
        boxShadow: "0 20px 40px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(34, 197, 94, 0.15)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <CardContent className="p-6">
        <div className="h-12 w-12 rounded-xl bg-brand-green/20 flex items-center justify-center mb-4 group-hover:bg-brand-green/30 transition-colors">
          <Icon className="h-6 w-6 text-brand-green" />
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-text-secondary">{description}</p>
        {details && (
          <motion.p
            initial={false}
            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-brand-green/90 mt-3 overflow-hidden"
          >
            {details}
          </motion.p>
        )}
      </CardContent>
    </motion.div>
  );
}
