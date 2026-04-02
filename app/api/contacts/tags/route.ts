import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getAdminFirestore } from "@/lib/firebase-admin";

const VALID_TAGS = ["VIP", "Lead", "Past Client", "Hot", "Follow Up", "Partner"];

// GET /api/contacts/tags — returns { [contactId]: string[] } for all user contacts
export async function GET() {
  const session = await getSession();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getAdminFirestore();
    const snap = await db.collection("contact_tags").where("userId", "==", uid).get();
    const result: Record<string, string[]> = {};
    snap.forEach((doc) => {
      const data = doc.data();
      result[data.contactId] = data.tags ?? [];
    });
    return NextResponse.json({ tags: result });
  } catch (err) {
    console.error("[contact tags GET]", err);
    return NextResponse.json({ tags: {} });
  }
}

// PATCH /api/contacts/tags — body: { contactId, tags: string[] }
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { contactId, tags } = body as { contactId: string; tags: string[] };
    if (!contactId || !Array.isArray(tags)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const validatedTags = tags.filter((t) => VALID_TAGS.includes(t));

    const db = getAdminFirestore();
    const docId = `${uid}_${contactId}`;
    await db.collection("contact_tags").doc(docId).set({
      userId: uid,
      contactId,
      tags: validatedTags,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, tags: validatedTags });
  } catch (err) {
    console.error("[contact tags PATCH]", err);
    return NextResponse.json({ error: "Failed to update tags" }, { status: 500 });
  }
}
