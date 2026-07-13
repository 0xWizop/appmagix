import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { setMilestoneApproval } from "@/lib/firestore";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  approvalStatus: z.enum(["APPROVED", "CHANGES_REQUESTED"]),
  note: z.string().max(500).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, milestoneId } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const ok = await setMilestoneApproval(
    projectId,
    milestoneId,
    session.user.id,
    parsed.data.approvalStatus,
    parsed.data.note
  );

  if (!ok) {
    return NextResponse.json({ error: "Milestone not found or access denied" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
