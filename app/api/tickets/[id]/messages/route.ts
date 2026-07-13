import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { addTicketMessage, addTicketMessageAdmin, getTicketOwner } from "@/lib/firestore";
import { z } from "zod";
import { sendTicketReplyNotification } from "@/lib/email";
import { getAdminFirestore } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["webmintdevelopment@gmail.com", "merchantmagix@gmail.com"];

const createMessageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id: ticketId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user record exists (sets role)
    await getOrCreateUserByFirebaseUid(session.user.id, session.user.email, session.user.name);

    const body = await req.json();
    const { content } = createMessageSchema.parse(body);

    const isAdmin = session.user.email && ADMIN_EMAILS.includes(session.user.email);

    const message = isAdmin
      ? await addTicketMessageAdmin(ticketId, session.user.id, content.trim())
      : await addTicketMessage(ticketId, session.user.id, content.trim());

    if (!message) {
      return NextResponse.json({ error: "Ticket not found or closed" }, { status: 404 });
    }

    // Notify the ticket owner (if the reply came from admin)
    try {
      const ownerId = await getTicketOwner(ticketId);
      if (ownerId && ownerId !== session.user.id) {
        const db = getAdminFirestore();
        const ownerSnap = await db.collection("users").doc(ownerId).get();
        const ownerEmail = ownerSnap.data()?.email;
        const ownerName = ownerSnap.data()?.name;
        if (ownerEmail && !ownerEmail.endsWith("@placeholder.local")) {
          sendTicketReplyNotification({
            to: ownerEmail,
            clientName: ownerName || "there",
            ticketSubject: ownerSnap.data()?.subject || "your ticket",
            replyContent: content.trim(),
            ticketId,
            replierName: session.user.name || "Webmint",
          }).catch((err) => console.error("Failed to send ticket reply email:", err));
        }
      }
    } catch (e) {
      console.error("Notification error:", e);
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
