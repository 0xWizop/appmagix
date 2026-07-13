import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { updateTicket } from "@/lib/firestore";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["webmintdevelopment@gmail.com", "merchantmagix@gmail.com"];

const updateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  await updateTicket(id, parsed.data);
  return NextResponse.json({ ok: true });
}
