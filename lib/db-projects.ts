import { db } from "@/lib/db";

export async function getProjectWithDetailsByPrismaUserId(projectId: string, prismaUserId: string) {
  const project = await db.project.findFirst({
    where: { id: projectId, userId: prismaUserId },
    include: {
      milestones: { orderBy: { sortOrder: "asc" } },
      tickets: { orderBy: { updatedAt: "desc" }, take: 5 },
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
    siteVerifiedAt: undefined,
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
      status: t.status,
    })),
    invoices: project.invoices.map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      amount: i.amount,
      status: i.status,
    })),
  };
}
