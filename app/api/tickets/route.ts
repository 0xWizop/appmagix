import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";
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

    const user = await getOrCreateUserByFirebaseUid(
      session.user.id,
      session.user.email,
      session.user.name
    );
    const tickets = await db.ticket.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { name: true } },
        _count: { select: { messages: true } },
      },
    });
    const ticketsForApi = tickets.map((t) => ({
      id: t.id,
      userId: t.userId,
      projectId: t.projectId,
      subject: t.subject,
      description: t.description,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      project: t.project ? { name: t.project.name } : undefined,
      messageCount: t._count.messages,
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

    const user = await getOrCreateUserByFirebaseUid(
      session.user.id,
      session.user.email,
      session.user.name
    );

    const body = await req.json();
    const { subject, description, priority, projectId } = createTicketSchema.parse(body);

    if (projectId) {
      const project = await db.project.findFirst({
        where: { id: projectId, userId: user.id },
      });
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
    }

    const ticket = await db.ticket.create({
      data: {
        userId: user.id,
        projectId: projectId || null,
        subject,
        description,
        priority: priority || "MEDIUM",
      },
    });

    return NextResponse.json(
      {
        ticket: {
          id: ticket.id,
          userId: ticket.userId,
          projectId: ticket.projectId,
          subject: ticket.subject,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
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
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
