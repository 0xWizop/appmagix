"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
}

export function ToolCard({
  title,
  icon: Icon,
  iconColor = "text-zinc-400",
  children,
  className,
}: ToolCardProps) {
  return (
    <div
      className={cn(
        "flex h-[320px] flex-col rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden",
        "hover:border-zinc-600 transition-colors duration-150",
        className
      )}
    >
      <div className="px-4 py-3 border-b border-zinc-700 bg-zinc-800 flex items-center gap-2 shrink-0">
        <Icon className={cn("h-4 w-4", iconColor)} />
        <span className="font-medium text-sm text-zinc-200">{title}</span>
      </div>
      <div className="p-4 flex-1 min-h-0 overflow-auto space-y-4">
        {children}
      </div>
    </div>
  );
}
