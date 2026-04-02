"use client";

import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
  content: string;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  /** If true, trigger is only the icon. If false, children wrap with the icon. */
  iconOnly?: boolean;
  children?: React.ReactNode;
}

export function HelpTooltip({
  content,
  className,
  side = "top",
  iconOnly = true,
  children,
}: HelpTooltipProps) {
  const trigger = iconOnly ? (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-full text-text-muted hover:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-green cursor-help",
        className
      )}
      aria-label="Help"
    >
      <HelpCircle className="h-4 w-4" />
    </button>
  ) : (
    children
  );

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side={side}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
