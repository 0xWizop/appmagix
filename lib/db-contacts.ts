import { db } from "@/lib/db";

export async function getContactsByOwner(ownerId: string) {
  const contacts = await db.contact.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });
  return contacts.map((c) => ({
    id: c.id,
    ownerId: c.ownerId,
    name: c.name,
    email: c.email ?? undefined,
    phone: c.phone ?? undefined,
    company: c.company ?? undefined,
    notes: c.notes ?? undefined,
    stage: c.stage,
    projectId: c.projectId ?? undefined,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

export async function getContactById(id: string, ownerId: string) {
  const contact = await db.contact.findFirst({
    where: { id, ownerId },
  });
  if (!contact) return null;
  return {
    id: contact.id,
    ownerId: contact.ownerId,
    name: contact.name,
    email: contact.email ?? undefined,
    phone: contact.phone ?? undefined,
    company: contact.company ?? undefined,
    notes: contact.notes ?? undefined,
    stage: contact.stage,
    projectId: contact.projectId ?? undefined,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
}
