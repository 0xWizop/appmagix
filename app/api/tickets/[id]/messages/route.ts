import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { addTicketMessage } from "@/lib/firestore";
import { z } from "zod";

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

    const body = await req.json();
    const { content } = createMessageSchema.parse(body);

    const message = await addTicketMessage(ticketId, session.user.id, content);

    if (!message) {
      return NextResponse.json({ error: "Ticket not found or resolved" }, { status: 404 });
    }

    return NextResponse.json({ message }, { status: 201 });
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
