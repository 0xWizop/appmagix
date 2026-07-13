import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getTicketWithMessages, getTicketOwner, updateTicket, deleteTicket } from "@/lib/firestore";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["webmintdevelopment@gmail.com", "merchantmagix@gmail.com"];

const updateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

function isAdmin(session: any) {
  return session?.user?.email && ADMIN_EMAILS.includes(session.user.email);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ticket = await getTicketWithMessages(id, session.user.id);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ticket });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  // Ownership check unless admin
  if (!isAdmin(session)) {
    const owner = await getTicketOwner(id);
    if (owner !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });

  await updateTicket(id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  if (!isAdmin(session)) {
    const owner = await getTicketOwner(id);
    if (owner !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteTicket(id);
  return NextResponse.json({ ok: true });
}
