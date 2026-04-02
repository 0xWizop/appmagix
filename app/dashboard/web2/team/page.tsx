import { getSession } from "@/lib/firebase-session";
import { getTeamDataByOwnerId } from "@/lib/db-team";
import { TeamPageClient } from "./team-client";

export default async function TeamPage() {
  const session = await getSession();
  const userId = session?.user?.id;

  let teamData = null;
  if (userId) {
    try {
      teamData = await getTeamDataByOwnerId(userId);
    } catch (e) {
      console.error("Team data error:", e);
    }
  }

  return (
    <TeamPageClient
      userId={userId ?? null}
      organization={teamData?.organization ?? null}
      members={teamData?.members ?? []}
      invites={teamData?.invites ?? []}
      currentUserRole={teamData?.currentUserRole ?? null}
    />
  );
}
