import { getSession } from "@/lib/firebase-session";
import { getContactsByOwner, getProjectsByOwner } from "@/lib/firestore";
import { CRMPageClient } from "./crm-client";

export default async function CRMPage() {
  const session = await getSession();
  const userId = session?.user?.id;

  let contacts: Awaited<ReturnType<typeof getContactsByOwner>> = [];
  let projects: Awaited<ReturnType<typeof getProjectsByOwner>> = [];
  if (userId) {
    try {
      [contacts, projects] = await Promise.all([
        getContactsByOwner(userId),
        getProjectsByOwner(userId),
      ]);
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
