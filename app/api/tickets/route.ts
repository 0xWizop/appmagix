import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getTicketsByUser, createTicket } from "@/lib/firestore";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  projectId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await getTicketsByUser(session.user.id);
    const ticketsForApi = tickets.map((t) => ({
      ...t,
      _count: { messages: t.messageCount ?? 0 },
    }));

    return NextResponse.json({ tickets: ticketsForApi });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subject, description, priority, projectId } = createTicketSchema.parse(body);

    // Verify project belongs to user if provided
    if (projectId) {
      const { getAdminFirestore } = await import("@/lib/firebase-admin");
      const projectSnap = await getAdminFirestore().collection("projects").doc(projectId).get();
      if (!projectSnap.exists || projectSnap.data()?.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
    }

    const ticket = await createTicket({
      userId: session.user.id,
      projectId: projectId || undefined,
      subject,
      description,
      priority,
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
