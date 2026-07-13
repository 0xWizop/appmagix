import { getTicketsByUser, getTicketWithMessages, getTicketWithMessagesAdmin } from "@/lib/firestore";

// firebaseUid IS the owner key now (Firestore-native)
export async function getTicketsByPrismaUserId(firebaseUid: string) {
  const tickets = await getTicketsByUser(firebaseUid);
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
    project: t.project,
    messageCount: t.messageCount,
  }));
}

export async function getTicketWithMessagesByPrismaUserId(ticketId: string, firebaseUid: string) {
  const ticket = await getTicketWithMessages(ticketId, firebaseUid);
  if (!ticket) return null;
  return {
    ...ticket,
    messages: ticket.messages.map((m) => ({
      id: m.id,
      ticketId: m.ticketId,
      senderId: m.senderId,
      content: m.content,
      createdAt: m.createdAt,
      sender: m.sender
        ? { name: m.sender.displayName ?? null, email: m.sender.email, avatarUrl: m.sender.photoURL, role: m.sender.role }
        : undefined,
    })),
  };
}

export { getTicketWithMessagesAdmin };
