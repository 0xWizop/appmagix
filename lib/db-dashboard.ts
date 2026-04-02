import { db } from "@/lib/db";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";

export type ProjectHealth = "healthy" | "needs_attention" | "overdue";

export interface DashboardActivity {
  id: string;
  type: "project" | "ticket" | "invoice" | "milestone";
  message: string;
  date: Date;
  href?: string;
  action?: string; // e.g. "Pay now"
}

export interface NeedAttentionItem {
  type: "invoice" | "ticket" | "milestone";
  id: string;
  title: string;
  href: string;
  meta?: string; // e.g. amount, due date
}

export async function getDashboardDataFromPrisma(firebaseUid: string): Promise<{
  projectCount: number;
  openTicketCount: number;
  pendingInvoiceTotal: number;
  projectsInDevelopment: number;
  recentActivity: DashboardActivity[];
  needAttention: NeedAttentionItem[];
  projects: {
    id: string;
    name: string;
    type: string;
    status: string;
    updatedAt: Date;
    websiteUrl: string | null;
    health: ProjectHealth;
    milestones: { status: string; title: string; dueDate: Date | null; completedAt: Date | null }[];
  }[];
} | null> {
  try {
    const user = await getOrCreateUserByFirebaseUid(firebaseUid, null, null);
    const [projects, tickets, invoices] = await Promise.all([
      db.project.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        include: {
          milestones: {
            orderBy: { sortOrder: "asc" },
            select: { status: true, title: true, dueDate: true, completedAt: true },
          },
        },
      }),
      db.ticket.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      }),
      db.invoice.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const now = new Date();
    const openTickets = tickets.filter((t) => t.status !== "RESOLVED");
    const pendingInvoices = invoices.filter((i) => i.status === "PENDING");
    const pendingTotal = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);
    const projectsInDev = projects.filter(
      (p) =>
        p.status === "DEVELOPMENT" || p.status === "DESIGN" || p.status === "REVIEW"
    ).length;

    const projectHealth = (
      milestones: { status: string; dueDate: Date | null; completedAt: Date | null }[]
    ): ProjectHealth => {
      const overdue = milestones.some(
        (m) =>
          m.status !== "COMPLETED" &&
          m.dueDate &&
          new Date(m.dueDate) < now
      );
      const dueSoon = milestones.some(
        (m) => {
          if (m.status === "COMPLETED" || !m.dueDate) return false;
          const d = new Date(m.dueDate);
          const days = (d.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
          return days >= 0 && days <= 7;
        }
      );
      if (overdue) return "overdue";
      if (dueSoon) return "needs_attention";
      return "healthy";
    };

    const needAttention: NeedAttentionItem[] = [];
    pendingInvoices.slice(0, 5).forEach((i) => {
      needAttention.push({
        type: "invoice",
        id: i.id,
        title: `Invoice ${i.invoiceNumber}`,
        href: "/dashboard/web2/billing",
        meta: `$${(i.amount / 100).toFixed(2)}`,
      });
    });
    openTickets.slice(0, 5).forEach((t) => {
      needAttention.push({
        type: "ticket",
        id: t.id,
        title: t.subject,
        href: `/dashboard/web2/support/${t.id}`,
      });
    });
    projects.forEach((p) => {
      p.milestones.forEach((m) => {
        if (
          m.status !== "COMPLETED" &&
          m.dueDate &&
          new Date(m.dueDate) < now
        ) {
          needAttention.push({
            type: "milestone",
            id: m.title + p.id,
            title: `${m.title} (${p.name})`,
            href: `/dashboard/web2/projects/${p.id}`,
            meta: "Overdue",
          });
        }
      });
    });

    const activity: DashboardActivity[] = [];

    projects.forEach((p) => {
      activity.push({
        id: `project-${p.id}`,
        type: "project",
        message: `Project "${p.name}" is ${p.status.replace("_", " ").toLowerCase()}`,
        date: p.updatedAt,
        href: `/dashboard/web2/projects/${p.id}`,
      });
      p.milestones
        .filter((m) => m.completedAt)
        .forEach((m) => {
          activity.push({
            id: `milestone-${p.id}-${m.title}`,
            type: "milestone",
            message: `"${m.title}" completed on ${p.name}`,
            date: m.completedAt!,
            href: `/dashboard/web2/projects/${p.id}`,
          });
        });
    });

    tickets.forEach((t) => {
      const verb = t.status === "RESOLVED" ? "was resolved" : "needs attention";
      activity.push({
        id: `ticket-${t.id}`,
        type: "ticket",
        message: `Support ticket "${t.subject}" ${verb}`,
        date: t.updatedAt,
        href: `/dashboard/web2/support/${t.id}`,
      });
    });

    invoices.filter((i) => i.status === "PAID").forEach((i) => {
      activity.push({
        id: `invoice-paid-${i.id}`,
        type: "invoice",
        message: `Invoice ${i.invoiceNumber} was paid`,
        date: i.paidAt || i.updatedAt || new Date(),
        href: "/dashboard/web2/billing",
      });
    });

    pendingInvoices.forEach((i) => {
      activity.push({
        id: `invoice-pending-${i.id}`,
        type: "invoice",
        message: `Invoice ${i.invoiceNumber} is pending payment`,
        date: i.updatedAt || new Date(),
        href: "/dashboard/web2/billing",
        action: "Pay now",
      });
    });

    activity.sort((a, b) => {
      const timeA = a.date instanceof Date && !isNaN(a.date.getTime()) ? a.date.getTime() : 0;
      const timeB = b.date instanceof Date && !isNaN(b.date.getTime()) ? b.date.getTime() : 0;
      return timeB - timeA;
    });
    const recentActivity = activity.slice(0, 12);

    return {
      projectCount: projects.length,
      openTicketCount: openTickets.length,
      pendingInvoiceTotal: pendingTotal,
      projectsInDevelopment: projectsInDev,
      recentActivity,
      needAttention,
      projects: projects.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status,
        updatedAt: p.updatedAt,
        websiteUrl: p.websiteUrl ?? null,
        health: projectHealth(p.milestones),
        milestones: p.milestones.map((m) => ({
          status: m.status,
          title: m.title,
          dueDate: m.dueDate,
          completedAt: m.completedAt,
        })),
      })),
    };
  } catch (e) {
    console.error("getDashboardDataFromPrisma error:", e);
    return null;
  }
}
