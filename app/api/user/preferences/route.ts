import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { z } from "zod";

export const dynamic = "force-dynamic";

const preferencesSchema = z.object({
  brandColors: z
    .object({
      primary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
      secondary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
      accent: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
    })
    .optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminFirestore();
    if (!db) {
      return NextResponse.json({ preferences: {} });
    }

    const doc = await db.collection("user_settings").doc(session.user.id).get();
    const data = doc.data();
    const brandColors = data?.preferences?.brandColors ?? {
      primary: "#34D399",
      secondary: "#10B981",
      accent: "#34D399",
    };
    return NextResponse.json({ preferences: { brandColors } });
  } catch (error) {
    console.error("Preferences GET error:", error);
    return NextResponse.json({ preferences: {} });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = preferencesSchema.parse(body);

    const db = getAdminFirestore();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const ref = db.collection("user_settings").doc(session.user.id);
    const current = await ref.get();
    const existing = current.data()?.preferences ?? {};
    const merged = { ...existing, ...parsed };

    await ref.set({ preferences: merged, updatedAt: new Date().toISOString() }, { merge: true });
    return NextResponse.json({ preferences: merged });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Preferences update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
