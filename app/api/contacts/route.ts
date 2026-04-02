import { NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const contacts = await db.contact.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      contacts.map((c) => ({
        id: c.id,
        ownerId: session.user!.id,
        name: c.name,
        email: c.email ?? undefined,
        phone: c.phone ?? undefined,
        company: c.company ?? undefined,
        notes: c.notes ?? undefined,
        stage: c.stage,
        projectId: c.projectId ?? undefined,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Contacts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, email, phone, company, notes, stage, projectId } = body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const contact = await db.contact.create({
      data: {
        ownerId: session.user.id,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        notes: notes?.trim() || null,
        stage: stage || "LEAD",
        projectId: projectId?.trim() || null,
      },
    });
    return NextResponse.json({
      id: contact.id,
      ownerId: contact.ownerId,
      name: contact.name,
      email: contact.email ?? undefined,
      phone: contact.phone ?? undefined,
      company: contact.company ?? undefined,
      notes: contact.notes ?? undefined,
      stage: contact.stage,
      projectId: contact.projectId ?? undefined,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    });
  } catch (error) {
    console.error("Contact create error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
