import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({ role: z.enum(["ADMIN", "MEMBER", "VIEWER"]) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: memberId } = await params;
  if (!memberId) {
    return NextResponse.json({ error: "Member ID required" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const { role } = patchSchema.parse(body);

    const member = await db.orgMember.findUnique({
      where: { id: memberId },
      include: { organization: true },
    });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    if (member.organization.ownerId !== session.user.id) {
      const currentUser = await db.orgMember.findFirst({
        where: {
          organizationId: member.organizationId,
          userId: session.user.id,
        },
      });
      if (currentUser?.role !== "ADMIN" && currentUser?.role !== "OWNER") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    if (member.role === "OWNER") {
      return NextResponse.json({ error: "Cannot change owner role" }, { status: 400 });
    }

    const updated = await db.orgMember.update({
      where: { id: memberId },
      data: { role },
    });
    return NextResponse.json({
      id: updated.id,
      userId: updated.userId,
      organizationId: updated.organizationId,
      role: updated.role,
      joinedAt: updated.joinedAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Update member error:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: memberId } = await params;
  if (!memberId) {
    return NextResponse.json({ error: "Member ID required" }, { status: 400 });
  }
  try {
    const member = await db.orgMember.findUnique({
      where: { id: memberId },
      include: { organization: true },
    });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    if (member.role === "OWNER") {
      return NextResponse.json({ error: "Cannot remove owner" }, { status: 400 });
    }
    const currentUser = await db.orgMember.findFirst({
      where: {
        organizationId: member.organizationId,
        userId: session.user.id,
      },
    });
    if (currentUser?.role !== "ADMIN" && currentUser?.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.orgMember.delete({ where: { id: memberId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
