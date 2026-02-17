import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateProfileSchema = z.object({
  displayName: z.string().min(1, "Name is required").max(100).optional(),
  accountType: z.enum(["USER", "DEVELOPER"]).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.parse(body);

    const db = getAdminFirestore();
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (parsed.displayName !== undefined) updates.displayName = parsed.displayName;
    if (parsed.accountType !== undefined) updates.accountType = parsed.accountType;

    await db.collection("users").doc(session.user.id).update(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
