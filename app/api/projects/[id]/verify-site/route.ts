import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { verifyProjectSite } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const verified = await verifyProjectSite(projectId, session.user.id);

    return NextResponse.json({ verified });
  } catch (error) {
    console.error("Verify site error:", error);
    return NextResponse.json(
      { error: "Failed to verify site" },
      { status: 500 }
    );
  }
}
