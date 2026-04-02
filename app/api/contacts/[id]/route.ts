import { NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { db } from "@/lib/db";

function contactToJson(c: {
  id: string;
  ownerId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  stage: string;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: c.id,
    ownerId: c.ownerId,
    name: c.name,
    email: c.email ?? undefined,
    phone: c.phone ?? undefined,
    company: c.company ?? undefined,
    notes: c.notes ?? undefined,
    stage: c.stage,
    projectId: c.projectId ?? undefined,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Contact ID required" }, { status: 400 });
  }
  try {
    const contact = await db.contact.findFirst({
      where: { id, ownerId: session.user.id },
    });
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    return NextResponse.json(contactToJson(contact));
  } catch (error) {
    console.error("Contact fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch contact" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Contact ID required" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const { stage, projectId, notes, name, email, phone, company } = body;
    const contact = await db.contact.findFirst({
      where: { id, ownerId: session.user.id },
    });
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    const updated = await db.contact.update({
      where: { id },
      data: {
        ...(stage !== undefined && { stage }),
        ...(projectId !== undefined && { projectId: projectId || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(name !== undefined && typeof name === "string" && name.trim() && { name: name.trim() }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(company !== undefined && { company: company?.trim() || null }),
      },
    });
    return NextResponse.json(contactToJson(updated));
  } catch (error) {
    console.error("Contact update error:", error);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Contact ID required" }, { status: 400 });
  }
  try {
    const contact = await db.contact.findFirst({
      where: { id, ownerId: session.user.id },
    });
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    await db.contact.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact delete error:", error);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
