import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { createProjectFromIntake } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isDeveloper = session.user.role === "ADMIN" || session.user.accountType === "DEVELOPER";
  if (!isDeveloper) {
    return NextResponse.json({ error: "Developer access required" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Intake ID required" }, { status: 400 });
  }

  try {
    const result = await createProjectFromIntake(id, session.user.id);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ project: result.project });
  } catch (error) {
    console.error("Create project from intake error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
