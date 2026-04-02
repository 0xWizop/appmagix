import { db } from "@/lib/db";

export async function getTicketsByPrismaUserId(prismaUserId: string) {
  const tickets = await db.ticket.findMany({
    where: { userId: prismaUserId },
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { name: true } },
      _count: { select: { messages: true } },
    },
  });
  return tickets.map((t) => ({
    id: t.id,
    userId: t.userId,
    projectId: t.projectId,
    subject: t.subject,
    description: t.description,
    status: t.status,
    priority: t.priority,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    project: t.project ? { name: t.project.name } : undefined,
    messageCount: t._count.messages,
  }));
}

export async function getTicketWithMessagesByPrismaUserId(
  ticketId: string,
  prismaUserId: string
) {
  const ticket = await db.ticket.findFirst({
    where: { id: ticketId, userId: prismaUserId },
    include: {
      project: { select: { name: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { name: true, email: true, avatarUrl: true, role: true } } },
      },
    },
  });
  if (!ticket) return null;
  return {
    id: ticket.id,
    userId: ticket.userId,
    projectId: ticket.projectId,
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    project: ticket.project ? { name: ticket.project.name } : undefined,
    messages: ticket.messages.map((m) => ({
      id: m.id,
      ticketId: m.ticketId,
      senderId: m.senderId,
      content: m.content,
      createdAt: m.createdAt,
      sender: m.sender
        ? {
            name: m.sender.name,
            email: m.sender.email,
            avatarUrl: m.sender.avatarUrl,
            role: m.sender.role,
          }
        : undefined,
    })),
  };
}
