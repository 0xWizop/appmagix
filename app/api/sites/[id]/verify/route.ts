import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { verifySite } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: siteId } = await params;
  const ok = await verifySite(siteId, session.user.id);
  return NextResponse.json({ verified: ok });
}
