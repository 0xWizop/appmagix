import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getAdminFirestore } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

function toDate(val: unknown): Date {
  if (val instanceof Date) return val;
  if (val && typeof val === "object" && "toDate" in val) {
    return (val as { toDate: () => Date }).toDate();
  }
  if (typeof val === "string") return new Date(val);
  return new Date();
}

export interface AppNotification {
  id: string;
  type: "ticket_reply" | "project_update" | "invoice_reminder" | "general";
  title: string;
  message: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

/** GET - List notifications for current user */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json({ notifications: [] });
  }

  try {
    const snapshot = await db
      .collection("notifications")
      .where("userId", "==", session.user.id)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const notifications: AppNotification[] = snapshot.docs.map((doc) => {
      const d = doc.data();
      const createdAt = toDate(d.createdAt);
      return {
        id: doc.id,
        type: d.type ?? "general",
        title: d.title ?? "",
        message: d.message ?? "",
        href: d.href,
        read: d.read ?? false,
        createdAt: createdAt.toISOString(),
      };
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (e) {
    console.error("Notifications fetch error:", e);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

/** PATCH - Mark notification(s) as read */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { ids, markAllRead } = body;

    if (markAllRead) {
      const snapshot = await db
        .collection("notifications")
        .where("userId", "==", session.user.id)
        .where("read", "==", false)
        .get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true, readAt: new Date().toISOString() });
      });
      await batch.commit();
      return NextResponse.json({ success: true });
    }

    if (Array.isArray(ids) && ids.length > 0) {
      const batch = db.batch();
      for (const id of ids) {
        const ref = db.collection("notifications").doc(id);
        const doc = await ref.get();
        if (doc.exists && doc.data()?.userId === session.user.id) {
          batch.update(ref, { read: true, readAt: new Date().toISOString() });
        }
      }
      await batch.commit();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (e) {
    console.error("Notifications update error:", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
