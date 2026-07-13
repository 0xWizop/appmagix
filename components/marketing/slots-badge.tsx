import { Zap } from "lucide-react";

/**
 * Scarcity badge — shows how many project slots remain this month.
 * Slots derive from the current month so it feels live and updates on its own,
 * without needing a backend. Ranges 1–3 remaining.
 */
export function SlotsBadge({ className = "" }: { className?: string }) {
  const now = new Date();
  const monthName = now.toLocaleString("en-US", { month: "long" });
  // Deterministic per-month value (1–3) so it's stable within a month
  const slotsLeft = (now.getMonth() % 3) + 1;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-brand-green/30 bg-brand-green/10 px-3 py-1.5 ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-green" />
      </span>
      <span className="text-xs font-medium text-brand-green">
        <Zap className="inline h-3 w-3 mr-0.5 -mt-0.5" />
        {slotsLeft === 1
          ? `Only 1 project slot left for ${monthName}`
          : `${slotsLeft} project slots left for ${monthName}`}
      </span>
    </div>
  );
}
