import { getSession } from "@/lib/firebase-session";
import { getContactsByOwner } from "@/lib/db-contacts";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";
import { CRMPageClient } from "./crm-client";

export default async function CRMPage() {
  const session = await getSession();
  const userId = session?.user?.id;

  let contacts: Awaited<ReturnType<typeof getContactsByOwner>> = [];
  let projects: { id: string; name: string }[] = [];
  if (userId) {
    try {
      const [contactList, user] = await Promise.all([
        getContactsByOwner(userId),
        getOrCreateUserByFirebaseUid(session.user!.id, session.user!.email, session.user!.name),
      ]);
      contacts = contactList;
      const projectList = await db.project.findMany({
        where: { userId: user.id },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
      projects = projectList;
    } catch (e) {
      console.error("CRM contacts error:", e);
    }
  }

  return (
    <CRMPageClient
      initialContacts={contacts}
      projects={projects.map((p) => ({ id: p.id, name: p.name }))}
    />
  );
}
