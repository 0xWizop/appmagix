import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { db } from "@/lib/db";
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
    const org = await db.organization.create({
      data: {
        ownerId: session.user.id,
        name: name.trim() || "My Organization",
      },
    });
    await db.orgMember.create({
      data: {
        organizationId: org.id,
        userId: session.user.id,
        role: "OWNER",
      },
    });
    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        ownerId: org.ownerId,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Create org error:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
