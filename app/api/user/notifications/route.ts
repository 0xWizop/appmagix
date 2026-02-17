import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { z } from "zod";

export const dynamic = "force-dynamic";

const notificationSchema = z.object({
  projectUpdates: z.boolean().optional(),
  supportResponses: z.boolean().optional(),
  invoiceReminders: z.boolean().optional(),
  marketingUpdates: z.boolean().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json({ notifications: defaults() });
  }

  const doc = await db.collection("user_settings").doc(session.user.id).get();
  const data = doc.data();
  const notifications = {
    projectUpdates: data?.notifications?.projectUpdates ?? true,
    supportResponses: data?.notifications?.supportResponses ?? true,
    invoiceReminders: data?.notifications?.invoiceReminders ?? true,
    marketingUpdates: data?.notifications?.marketingUpdates ?? false,
  };
  return NextResponse.json({ notifications });
}

function defaults() {
  return {
    projectUpdates: true,
    supportResponses: true,
    invoiceReminders: true,
    marketingUpdates: false,
  };
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = notificationSchema.parse(body);

    const db = getAdminFirestore();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const ref = db.collection("user_settings").doc(session.user.id);
    const current = await ref.get();
    const existing = current.data()?.notifications ?? {};
    const merged = {
      ...defaults(),
      ...existing,
      ...parsed,
    };

    await ref.set(
      {
        notifications: merged,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ notifications: merged });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Notifications update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
