import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { z } from "zod";

export const dynamic = "force-dynamic";

const preferencesSchema = z.object({
  devMode: z.boolean().optional(),
  onboardingDismissed: z.boolean().optional(),
  onboardingChecklistChecked: z
    .object({
      project: z.boolean().optional(),
      connect: z.boolean().optional(),
      contact: z.boolean().optional(),
    })
    .optional(),
  web3Mode: z.boolean().optional(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional().nullable(),
  governanceConfig: z
    .object({
      governorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      chainId: z.number(),
    })
    .optional()
    .nullable(),
});

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json({ preferences: { devMode: false, web3Mode: false } });
  }

  const doc = await db.collection("user_settings").doc(session.user.id).get();
  const data = doc.data();
  const devMode = data?.preferences?.devMode ?? false;
  const onboardingDismissed = data?.preferences?.onboardingDismissed ?? false;
  const onboardingChecklistChecked = data?.preferences?.onboardingChecklistChecked ?? {};
  const web3Mode = data?.preferences?.web3Mode ?? false;
  const walletAddress = data?.preferences?.walletAddress ?? null;
  const governanceConfig = data?.preferences?.governanceConfig ?? null;
  return NextResponse.json({
    preferences: { devMode, onboardingDismissed, onboardingChecklistChecked, web3Mode, walletAddress, governanceConfig },
  });
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

    await ref.set(
      {
        preferences: merged,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ preferences: merged });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Preferences update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
