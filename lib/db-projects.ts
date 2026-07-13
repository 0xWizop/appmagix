import { getProjectWithDetails, getProjectWithDetailsAdmin as fsGetProjectAdmin } from "@/lib/firestore";

function shapeTicket(t: any) {
  return {
    id: t.id,
    subject: t.subject,
    description: t.description ?? "",
    status: t.status as "OPEN" | "IN_PROGRESS" | "RESOLVED",
    priority: (t.priority ?? "MEDIUM") as "LOW" | "MEDIUM" | "HIGH",
    createdAt: (t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt)).toISOString(),
    updatedAt: (t.updatedAt instanceof Date ? t.updatedAt : new Date(t.updatedAt ?? t.createdAt)).toISOString(),
    user: t.user,
  };
}

// firebaseUid IS the owner key now (Firestore-native)
export async function getProjectWithDetailsByPrismaUserId(projectId: string, firebaseUid: string) {
  const project = await getProjectWithDetails(projectId, firebaseUid);
  if (!project) return null;
  return {
    ...project,
    tickets: project.tickets.map(shapeTicket),
  };
}

export async function getProjectWithDetailsAdmin(projectId: string) {
  const project = await fsGetProjectAdmin(projectId);
  if (!project) return null;
  return {
    ...project,
    tickets: project.tickets.map(shapeTicket),
  };
}
