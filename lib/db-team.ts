import { db } from "@/lib/db";
import type { OrgInvite } from "@/lib/firestore";

type Role = "ADMIN" | "MEMBER" | "VIEWER" | "OWNER";

export async function getTeamDataByOwnerId(ownerId: string) {
  const org = await db.organization.findFirst({
    where: { ownerId },
    include: { members: true },
  });
  if (!org) return { organization: null, members: [], invites: [] as OrgInvite[], currentUserRole: null as Role | null };
  const currentMember = org.members.find((m) => m.userId === ownerId);

  // Resolve display names and emails from User table (userId = Firebase UID = firebaseUid in User)
  const userIds = Array.from(new Set(org.members.map((m) => m.userId)));
  const users = await db.user.findMany({
    where: { firebaseUid: { in: userIds } },
    select: { firebaseUid: true, name: true, email: true },
  });
  const userByUid = Object.fromEntries(
    users.map((u) => [u.firebaseUid, { displayName: u.name ?? undefined, email: u.email }])
  );

  const members = org.members.map((m) => {
    const u = userByUid[m.userId];
    return {
      id: m.id,
      userId: m.userId,
      organizationId: m.organizationId,
      role: m.role as Role,
      joinedAt: m.joinedAt,
      displayName: u?.displayName ?? undefined,
      email: u?.email ?? undefined,
    };
  });

  return {
    organization: {
      id: org.id,
      name: org.name,
      ownerId: org.ownerId,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    },
    members,
    invites: [] as OrgInvite[],
    currentUserRole: (currentMember?.role ?? null) as Role | null,
  };
}
