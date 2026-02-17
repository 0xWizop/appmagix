import { NextRequest, NextResponse } from "next/server";
import { getInviteByToken } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const token = (await params).token;
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }
  const result = await getInviteByToken(token);
  if (!result) {
    return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });
  }
  return NextResponse.json(result);
}
