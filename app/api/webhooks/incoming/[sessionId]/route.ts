import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  return handleIncoming(req, (await params).sessionId);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  return handleIncoming(req, (await params).sessionId);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  return handleIncoming(req, (await params).sessionId);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  return handleIncoming(req, (await params).sessionId);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  return handleIncoming(req, (await params).sessionId);
}

async function handleIncoming(req: NextRequest, sessionId: string) {
  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const sessionIdClean = sessionId.replace(/[^a-zA-Z0-9-]/g, "");
  if (!sessionIdClean) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const sessionDoc = await db.collection("webhook_sessions").doc(sessionIdClean).get();
  if (!sessionDoc.exists) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    if (!k.toLowerCase().startsWith("x-") && k.toLowerCase() !== "authorization") {
      headers[k] = v;
    }
  });
  req.headers.forEach((v, k) => {
    if (k.toLowerCase().startsWith("x-") || k.toLowerCase() === "authorization") {
      headers[k] = v;
    }
  });

  let body: string | null = null;
  try {
    body = await req.text();
  } catch {
    body = null;
  }

  await db.collection("webhook_requests").add({
    sessionId: sessionIdClean,
    method: req.method,
    headers,
    body,
    timestamp: Timestamp.fromDate(new Date()),
  });

  return NextResponse.json({ ok: true, received: true }, { status: 200 });
}
