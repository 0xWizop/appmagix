import { Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore, adminApp } from "@/lib/firebase-admin";

const db = () => getAdminFirestore();

const ADMIN_EMAIL = "webmintdevelopment@gmail.com";
const LEGACY_ADMIN_EMAIL = "merchantmagix@gmail.com";

/**
 * Get or create a user record in Firestore keyed by Firebase UID.
 * Returns { id: firebaseUid, email, name, role } — id IS the Firebase UID.
 * Kept this function name to avoid churn across the codebase.
 */
export async function getOrCreateUserByFirebaseUid(
  firebaseUid: string,
  email: string | null,
  name: string | null
): Promise<{ id: string; email: string; name: string | null; role: string }> {
  const safeEmail = email?.trim() || `user-${firebaseUid}@placeholder.local`;
  const isAdmin = safeEmail === ADMIN_EMAIL || safeEmail === LEGACY_ADMIN_EMAIL;

  if (!adminApp) {
    return { id: firebaseUid, email: safeEmail, name: name?.trim() || null, role: isAdmin ? "ADMIN" : "CLIENT" };
  }

  const ref = db().collection("users").doc(firebaseUid);
  const snap = await ref.get();

  if (snap.exists) {
    const data = snap.data()!;
    // Ensure admin role stays correct
    const role = isAdmin ? "ADMIN" : (data.role ?? "CLIENT");
    if (data.role !== role) {
      await ref.update({ role, updatedAt: Timestamp.now() });
    }
    return {
      id: firebaseUid,
      email: data.email ?? safeEmail,
      name: data.name ?? name?.trim() ?? null,
      role,
    };
  }

  const now = Timestamp.now();
  const role = isAdmin ? "ADMIN" : "CLIENT";
  await ref.set({
    email: safeEmail,
    name: name?.trim() || null,
    role,
    createdAt: now,
    updatedAt: now,
  });
  return { id: firebaseUid, email: safeEmail, name: name?.trim() || null, role };
}
