import { db } from "@/lib/db";

const ACTIVE_STATUSES = ["active", "trialing"];

export async function hasActiveSubscription(prismaUserId: string): Promise<boolean> {
  const sub = await db.subscription.findUnique({
    where: { userId: prismaUserId },
  });
  if (!sub || !ACTIVE_STATUSES.includes(sub.status)) return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) return false;
  return true;
}

export async function getSubscription(prismaUserId: string) {
  return db.subscription.findUnique({
    where: { userId: prismaUserId },
  });
}
