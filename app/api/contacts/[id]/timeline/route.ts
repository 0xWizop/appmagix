import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";

// GET /api/contacts/[id]/timeline — returns chronological events for a contact
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await getOrCreateUserByFirebaseUid(uid, session.user?.email, session.user?.name);

    // Verify contact belongs to user
    const contact = await db.contact.findFirst({
      where: { id: params.id, ownerId: user.id },
    });
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Build timeline events
    const events: { type: string; label: string; detail?: string; date: Date; icon: string }[] = [];

    // Contact created
    events.push({
      type: "created",
      label: "Contact added",
      detail: contact.stage ? `Stage: ${contact.stage}` : undefined,
      date: contact.createdAt,
      icon: "user",
    });

    // Project linked
    if (contact.projectId) {
      const project = await db.project.findFirst({ where: { id: contact.projectId }, select: { name: true, status: true } });
      if (project) {
        events.push({
          type: "project",
          label: `Linked to project: ${project.name}`,
          detail: `Status: ${project.status}`,
          date: contact.updatedAt,
          icon: "folder",
        });
      }
    }

    // Tickets linked to same project
    if (contact.projectId) {
      const tickets = await db.ticket.findMany({
        where: { projectId: contact.projectId, userId: user.id },
        orderBy: { createdAt: "asc" },
        select: { id: true, subject: true, status: true, createdAt: true },
      });
      for (const ticket of tickets) {
        events.push({
          type: "ticket",
          label: `Ticket: ${ticket.subject}`,
          detail: ticket.status,
          date: ticket.createdAt,
          icon: "message",
        });
      }

      // Invoices linked to same project
      const invoices = await db.invoice.findMany({
        where: { projectId: contact.projectId, userId: user.id },
        orderBy: { createdAt: "asc" },
        select: { id: true, invoiceNumber: true, amount: true, status: true, createdAt: true, paidAt: true },
      });
      for (const inv of invoices) {
        events.push({
          type: "invoice",
          label: `Invoice ${inv.invoiceNumber} — $${(inv.amount / 100).toFixed(2)}`,
          detail: inv.status,
          date: inv.createdAt,
          icon: "credit-card",
        });
        if (inv.paidAt) {
          events.push({
            type: "payment",
            label: `Payment received for ${inv.invoiceNumber}`,
            date: inv.paidAt,
            icon: "check",
          });
        }
      }
    }

    // Sort by date ascending
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ events });
  } catch (err) {
    console.error("[contact timeline GET]", err);
    return NextResponse.json({ error: "Failed to build timeline" }, { status: 500 });
  }
}
