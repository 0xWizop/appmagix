import { NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getContactsByOwner, createContact } from "@/lib/firestore";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const contacts = await getContactsByOwner(session.user.id);
    return NextResponse.json(contacts);
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
    const contact = await createContact(session.user.id, {
      name: name.trim(),
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      company: company?.trim() || undefined,
      notes: notes?.trim() || undefined,
      stage: stage || "LEAD",
      projectId: projectId || undefined,
    });
    return NextResponse.json(contact);
  } catch (error) {
    console.error("Contact create error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
