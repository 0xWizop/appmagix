import { db } from "@/lib/db";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { FolderKanban, MessageSquare, CreditCard, CalendarDays, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function isThisWeek(date: Date | null): boolean {
  if (!date) return false;
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Sunday
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return date >= weekStart && date < weekEnd;
}

function isPast(date: Date | null): boolean {
  if (!date) return false;
  return date < new Date();
}

export async function FocusPanel() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  let projects: { id: string; name: string; targetLaunchDate: Date | null; status: string }[] = [];
  let invoices: { id: string; invoiceNumber: string; amount: number; dueDate: Date | null; status: string }[] = [];

  try {
    const user = await getOrCreateUserByFirebaseUid(
      session.user.id,
      session.user.email,
      session.user.name
    );

    [projects, invoices] = await Promise.all([
      db.project.findMany({
        where: { userId: user.id, status: { not: "LAUNCHED" } },
        select: { id: true, name: true, targetLaunchDate: true, status: true },
        orderBy: { targetLaunchDate: "asc" },
      }),
      db.invoice.findMany({
        where: { userId: user.id, status: "PENDING" },
        select: { id: true, invoiceNumber: true, amount: true, dueDate: true, status: true },
        orderBy: { dueDate: "asc" },
      }),
    ]);
  } catch {
    return null;
  }

  const thisWeekProjects = projects.filter((p) => isThisWeek(p.targetLaunchDate));
  const overdueInvoices = invoices.filter((inv) => isPast(inv.dueDate));
  const upcomingInvoices = invoices.filter((inv) => !isPast(inv.dueDate) && isThisWeek(inv.dueDate));

  const hasItems = thisWeekProjects.length > 0 || overdueInvoices.length > 0 || upcomingInvoices.length > 0;

  if (!hasItems) {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-text-secondary flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          This Week
        </h2>
        <p className="text-xs text-text-muted py-2">
          All clear! No deadlines or overdue items this week. 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-text-secondary flex items-center gap-2">
        <CalendarDays className="h-4 w-4" />
        This Week
      </h2>

      <div className="space-y-2">
        {/* Overdue invoices — highest priority */}
        {overdueInvoices.map((inv) => (
          <Link
            key={inv.id}
            href="/dashboard/web2/billing"
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
              "border-red-500/30 bg-red-500/5 hover:border-red-500/50"
            )}
          >
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-red-300 truncate">
                Overdue: {inv.invoiceNumber}
              </div>
              <div className="text-xs text-red-400/70">
                ${(inv.amount / 100).toFixed(2)} — was due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </Link>
        ))}

        {/* Projects with launch deadline this week */}
        {thisWeekProjects.map((proj) => (
          <Link
            key={proj.id}
            href={`/dashboard/web2/projects/${proj.id}`}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
              "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
            )}
          >
            <FolderKanban className="h-4 w-4 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-amber-300 truncate">{proj.name}</div>
              <div className="text-xs text-amber-400/70">
                Target launch: {proj.targetLaunchDate ? new Date(proj.targetLaunchDate).toLocaleDateString() : "TBD"}
              </div>
            </div>
          </Link>
        ))}

        {/* Invoices due this week */}
        {upcomingInvoices.map((inv) => (
          <Link
            key={inv.id}
            href="/dashboard/web2/billing"
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
              "border-border bg-surface hover:border-brand-green/40"
            )}
          >
            <CreditCard className="h-4 w-4 text-text-muted shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">Due this week: {inv.invoiceNumber}</div>
              <div className="text-xs text-text-muted">
                ${(inv.amount / 100).toFixed(2)} due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
