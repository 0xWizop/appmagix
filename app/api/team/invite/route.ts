import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { inviteToOrganization } from "@/lib/firestore";
import { z } from "zod";

export const dynamic = "force-dynamic";

const inviteSchema = z.object({
  organizationId: z.string().min(1),
  email: z.string().email("Valid email required"),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { organizationId, email, role } = inviteSchema.parse(body);
    const result = await inviteToOrganization(organizationId, session.user.id, email, role);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
    const inviteUrl = result.token ? `${baseUrl}/invite/${result.token}` : undefined;
    return NextResponse.json({ success: true, inviteUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Invite error:", error);
    return NextResponse.json({ error: "Failed to invite" }, { status: 500 });
  }
}
