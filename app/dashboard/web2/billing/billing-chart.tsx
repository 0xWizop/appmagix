"use client";

import { formatCurrency } from "@/lib/utils";

interface Invoice {
  amount: number;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
}

interface BillingChartProps {
  invoices: Invoice[];
}

function getLastNMonths(n: number) {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("default", { month: "short" }),
    });
  }
  return months;
}

export function BillingChart({ invoices }: BillingChartProps) {
  const months = getLastNMonths(6);

  // Sum paid amounts by month (using paidAt date)
  const monthlyData = months.map(({ key, label }) => {
    const total = invoices
      .filter((inv) => {
        if (inv.status !== "PAID" || !inv.paidAt) return false;
        const d = new Date(inv.paidAt);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return k === key;
      })
      .reduce((sum, inv) => sum + inv.amount, 0);
    return { label, total };
  });

  const maxTotal = Math.max(...monthlyData.map((m) => m.total), 1);
  const hasData = monthlyData.some((m) => m.total > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between h-32 gap-2">
        {monthlyData.map(({ label, total }) => {
          const pct = (total / maxTotal) * 100;
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              {total > 0 && (
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
                  <div className="bg-background border border-border rounded-md px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                    {formatCurrency(total / 100)}
                  </div>
                </div>
              )}
              <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
                <div
                  className="w-full rounded-t-sm transition-all duration-500 group-hover:opacity-80"
                  style={{
                    height: total > 0 ? `${Math.max(pct, 4)}%` : "4%",
                    background: total > 0
                      ? "linear-gradient(to top, #00D166, #00D16688)"
                      : "rgba(255,255,255,0.06)",
                  }}
                />
              </div>
              <span className="text-[10px] text-text-muted">{label}</span>
            </div>
          );
        })}
      </div>
      {!hasData && (
        <p className="text-xs text-text-muted text-center">
          Payment history will appear here once invoices are paid.
        </p>
      )}
    </div>
  );
}
