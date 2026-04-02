import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateBookingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
  projectId: z.string().nullable().optional(),
});

/** PATCH: update a booking. Clients can only update their own; admins can update any. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const isAdmin = session.user.role === "ADMIN";
    const { id } = await params;

    const existing = await db.booking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (!isAdmin && existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateBookingSchema.parse(body);
    const data: { title?: string; description?: string; startTime?: Date; endTime?: Date; status?: "SCHEDULED" | "COMPLETED" | "CANCELLED"; projectId?: string | null } = {};
    if (parsed.title !== undefined) data.title = parsed.title;
    if (parsed.description !== undefined) data.description = parsed.description;
    if (parsed.startTime !== undefined) data.startTime = new Date(parsed.startTime);
    if (parsed.endTime !== undefined) data.endTime = new Date(parsed.endTime);
    if (parsed.status !== undefined) data.status = parsed.status;
    if (parsed.projectId !== undefined) data.projectId = parsed.projectId;

    const booking = await db.booking.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      booking: {
        id: booking.id,
        userId: booking.userId,
        projectId: booking.projectId,
        title: booking.title,
        description: booking.description,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        status: booking.status,
        user: booking.user,
        project: booking.project,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

/** DELETE: cancel a booking (set status to CANCELLED). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const isAdmin = session.user.role === "ADMIN";
    const { id } = await params;

    const existing = await db.booking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (!isAdmin && existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
