import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { acceptInvite } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Sign in to accept" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const token = body.token;
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const result = await acceptInvite(token, session.user.id, session.user.email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
