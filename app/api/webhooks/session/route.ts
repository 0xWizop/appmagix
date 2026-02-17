import { NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = randomUUID();
  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  await db.collection("webhook_sessions").doc(sessionId).set({
    userId: session.user.id,
    createdAt: Timestamp.fromDate(new Date()),
  });

  return NextResponse.json({ sessionId });
}
