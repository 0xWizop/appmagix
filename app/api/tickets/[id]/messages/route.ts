import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";
import { z } from "zod";
import { sendTicketReplyNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

const createMessageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    const { id: ticketId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUserByFirebaseUid(
      session.user.id,
      session.user.email,
      session.user.name
    );

    const body = await req.json();
    const { content } = createMessageSchema.parse(body);

    // Load ticket with owner info for email notification
    const ticket = await db.ticket.findFirst({
      where: { id: ticketId, userId: user.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const message = await db.ticketMessage.create({
      data: {
        ticketId,
        senderId: user.id,
        content: content.trim(),
      },
    });

    // Send email to the ticket owner if the reply is NOT from the owner themselves
    // (i.e., admin replied — or just always notify for now since there's no admin role check)
    if (
      ticket.user?.email &&
      !ticket.user.email.endsWith("@placeholder.local")
    ) {
      sendTicketReplyNotification({
        to: ticket.user.email,
        clientName: ticket.user.name || "there",
        ticketSubject: ticket.subject,
        replyContent: content.trim(),
        ticketId: ticketId,
        replierName: session.user.name || undefined,
      }).catch((err) =>
        console.error("Failed to send ticket reply email:", err)
      );
    }

    return NextResponse.json(
      {
        message: {
          id: message.id,
          ticketId: message.ticketId,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
