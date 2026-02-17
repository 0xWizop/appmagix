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

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json({ requests: [] });
  }

  const sessionDoc = await db.collection("webhook_sessions").doc(sessionId).get();
  if (!sessionDoc.exists || sessionDoc.data()?.userId !== session.user.id) {
    return NextResponse.json({ error: "Invalid session" }, { status: 403 });
  }

  const snapshot = await db
    .collection("webhook_requests")
    .where("sessionId", "==", sessionId)
    .orderBy("timestamp", "desc")
    .limit(50)
    .get();

  const requests = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      method: data.method,
      headers: data.headers ?? {},
      body: data.body ?? "",
      timestamp: toDate(data.timestamp),
    };
  });

  return NextResponse.json({ requests });
}
