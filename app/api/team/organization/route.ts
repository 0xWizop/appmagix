import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { createOrganization } from "@/lib/firestore";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Session expired. Please sign in again." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { name } = createSchema.parse(body);
    const org = await createOrganization(session.user.id, name);
    if (!org) return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
    return NextResponse.json({ organization: org });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : "Failed to create";
    console.error("Create org error:", error);
    return NextResponse.json(
      { error: msg.includes("not configured") ? "Server configuration error. Please contact support." : "Failed to create organization" },
      { status: 500 }
    );
  }
}
