import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const PHASES = [
  { key: "DISCOVERY", label: "Discovery" },
  { key: "DESIGN", label: "Design" },
  { key: "DEVELOPMENT", label: "Development" },
  { key: "REVIEW", label: "Review" },
  { key: "LAUNCHED", label: "Launched" },
];

export function PhaseTracker({ status }: { status: string }) {
  const currentIndex = PHASES.findIndex((p) => p.key === status);

  return (
    <div className="w-full py-2">
      <div className="flex items-center">
        {PHASES.map((phase, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={phase.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0",
                    done && "bg-brand-green border-brand-green text-black",
                    active && "border-brand-green text-brand-green bg-brand-green/10 shadow-[0_0_16px_rgba(52,211,153,0.35)]",
                    !done && !active && "border-border text-text-muted bg-surface"
                  )}
                >
                  {done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">{i + 1}</span>
                  )}
                  {active && (
                    <span className="absolute h-9 w-9 rounded-full border-2 border-brand-green animate-ping opacity-30" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap",
                    active ? "text-brand-green" : done ? "text-text-secondary" : "text-text-muted"
                  )}
                >
                  {phase.label}
                </span>
              </div>
              {i < PHASES.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 -mt-6 rounded-full overflow-hidden bg-border">
                  <div
                    className={cn(
                      "h-full bg-brand-green transition-all duration-700",
                      i < currentIndex ? "w-full" : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
