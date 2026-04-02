import { cookies } from "next/headers";
import { getAdminAuth, getAdminFirestore, SESSION_COOKIE_NAME } from "./firebase-admin";

export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role?: string;
  accountType?: "USER" | "DEVELOPER";
}

/** Get the current session from the Firebase session cookie. Use in server components and API routes. */
export async function getSession(): Promise<{ user: SessionUser } | null> {
  try {
    let adminAuth;
    try {
      adminAuth = getAdminAuth();
    } catch {
      return null;
    }
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    let name = decoded.name ?? null;
    let image = decoded.picture ?? null;
    let role = decoded.role ?? "CLIENT";

    let accountType: "USER" | "DEVELOPER" = "USER";
    try {
      const firestore = getAdminFirestore();
      const userDoc = await firestore.collection("users").doc(decoded.uid).get();
      if (userDoc.exists) {
        const data = userDoc.data()!;
        name = name ?? data.displayName ?? null;
        image = image ?? data.photoURL ?? null;
        role = data.role ?? role;
        accountType = data.accountType === "DEVELOPER" ? "DEVELOPER" : "USER";
      }
    } catch {
      // Firestore not configured or read failed; use token data only
    }

    return {
      user: {
        id: decoded.uid,
        email: decoded.email ?? null,
        name,
        image,
        role,
        accountType,
      },
    };
  } catch (error) {
    console.error("[getSession] Unexpected error:", error);
    return null;
  }
}
