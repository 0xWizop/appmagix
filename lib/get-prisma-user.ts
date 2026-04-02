import { db } from "@/lib/db";

/**
 * Get or create a Prisma User from Firebase UID (for dashboard users using Firebase Auth).
 * Used so we can store tickets, invoices, projects in PostgreSQL keyed by User id.
 */
export async function getOrCreateUserByFirebaseUid(
  firebaseUid: string,
  email: string | null,
  name: string | null
): Promise<{ id: string; email: string; name: string | null }> {
  const existing = await db.user.findUnique({
    where: { firebaseUid },
  });
  if (existing) return existing;

  const safeEmail = email?.trim() || `user-${firebaseUid}@placeholder.local`;
  const existingByEmail = await db.user.findUnique({
    where: { email: safeEmail },
  });
  if (existingByEmail) {
    await db.user.update({
      where: { id: existingByEmail.id },
      data: { firebaseUid },
    });
    return existingByEmail;
  }

  const created = await db.user.create({
    data: {
      firebaseUid,
      email: safeEmail,
      name: name?.trim() || null,
    },
  });
  return created;
}
