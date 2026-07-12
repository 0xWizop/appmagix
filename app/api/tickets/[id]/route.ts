import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const user = await getOrCreateUserByFirebaseUid(session.user.id, session.user.email, session.user.name);

  const ticket = await db.ticket.findFirst({
    where: { id, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { name: true, email: true, role: true } } } } },
  });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ticket });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const user = await getOrCreateUserByFirebaseUid(session.user.id, session.user.email, session.user.name);

  // Clients can only update their own tickets, admins can update any
  const isAdmin = user.role === "ADMIN" || session.user.email === "merchantmagix@gmail.com";
  const where = isAdmin ? { id } : { id, userId: user.id };

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });

  try {
    const ticket = await db.ticket.update({
      where,
      data: {
        ...(parsed.data.status && { status: parsed.data.status }),
        ...(parsed.data.priority && { priority: parsed.data.priority }),
      },
    });
    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json({ error: "Ticket not found or access denied" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const user = await getOrCreateUserByFirebaseUid(session.user.id, session.user.email, session.user.name);
  const isAdmin = user.role === "ADMIN" || session.user.email === "merchantmagix@gmail.com";
  const where = isAdmin ? { id } : { id, userId: user.id };

  try {
    await db.ticket.delete({ where });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
