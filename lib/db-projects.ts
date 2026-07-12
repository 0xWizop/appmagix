import { db } from "@/lib/db";

export async function getProjectWithDetailsByPrismaUserId(projectId: string, prismaUserId: string) {
  const project = await db.project.findFirst({
    where: { id: projectId, userId: prismaUserId },
    include: {
      milestones: { orderBy: { sortOrder: "asc" } },
      tickets: {
        orderBy: { updatedAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      },
      invoices: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!project) return null;
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    type: project.type,
    status: project.status,
    startDate: project.startDate,
    targetLaunchDate: project.targetLaunchDate,
    websiteUrl: project.websiteUrl,
    siteVerifiedAt: undefined as Date | undefined,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    milestones: project.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      status: m.status,
      dueDate: m.dueDate,
      completedAt: m.completedAt,
      sortOrder: m.sortOrder,
    })),
    tickets: project.tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      description: t.description,
      status: t.status as "OPEN" | "IN_PROGRESS" | "RESOLVED",
      priority: t.priority as "LOW" | "MEDIUM" | "HIGH",
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      user: t.user ? { name: t.user.name, email: t.user.email } : undefined,
    })),
    invoices: project.invoices.map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      amount: i.amount,
      status: i.status,
    })),
  };
}

// Admin version — can access any project regardless of owner
export async function getProjectWithDetailsAdmin(projectId: string) {
  const project = await db.project.findFirst({
    where: { id: projectId },
    include: {
      milestones: { orderBy: { sortOrder: "asc" } },
      tickets: {
        orderBy: { updatedAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      },
      invoices: { orderBy: { createdAt: "desc" }, take: 5 },
      user: { select: { name: true, email: true } },
    },
  });
  if (!project) return null;
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    type: project.type,
    status: project.status,
    startDate: project.startDate,
    targetLaunchDate: project.targetLaunchDate,
    websiteUrl: project.websiteUrl,
    siteVerifiedAt: undefined as Date | undefined,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    owner: project.user,
    milestones: project.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      status: m.status,
      dueDate: m.dueDate,
      completedAt: m.completedAt,
      sortOrder: m.sortOrder,
    })),
    tickets: project.tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      description: t.description,
      status: t.status as "OPEN" | "IN_PROGRESS" | "RESOLVED",
      priority: t.priority as "LOW" | "MEDIUM" | "HIGH",
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      user: t.user ? { name: t.user.name, email: t.user.email } : undefined,
    })),
    invoices: project.invoices.map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      amount: i.amount,
      status: i.status,
    })),
  };
}
