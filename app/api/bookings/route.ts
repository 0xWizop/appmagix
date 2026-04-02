import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { sendBookingConfirmation } from "@/lib/email";

export const dynamic = "force-dynamic";

const createBookingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  startTime: z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid start time"),
  endTime: z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid end time"),
  projectId: z.string().optional(),
  userId: z.string().optional(), // only admins can set; otherwise current user
});

/** GET: list bookings. Query: start, end (ISO date strings) for range. Clients see only their own; admins see all. */
export async function GET(req: NextRequest) {
  try {
    if (!db?.booking) {
      return NextResponse.json(
        { error: "Server setup incomplete. Run: npx prisma generate then restart the dev server." },
        { status: 503 }
      );
    }
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

    const { searchParams } = new URL(req.url);
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    const where: Prisma.BookingWhereInput = {
      status: "SCHEDULED",
    };
    if (!isAdmin) {
      where.OR = [
        { userId: user.id },
        { bookingLink: { ownerId: user.id } },
      ];
    }
    if (startParam && endParam) {
      where.startTime = { lt: new Date(endParam) };
      where.endTime = { gt: new Date(startParam) };
    }
    const bookings = await db.booking.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        bookingLink: { select: { id: true, title: true, slug: true } },
      },
    });

    const list = bookings.map((b) => ({
      id: b.id,
      userId: b.userId,
      projectId: b.projectId,
      bookingLinkId: b.bookingLinkId,
      title: b.title,
      description: b.description,
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
      status: b.status,
      user: b.user,
      project: b.project,
      bookingLink: b.bookingLink,
    }));

    return NextResponse.json({ bookings: list });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch bookings: ${message}` },
      { status: 500 }
    );
  }
}

/** POST: create a booking. Clients create for themselves; admins can set userId. */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await getOrCreateUserByFirebaseUid(
      session.user.id,
      session.user.email,
      session.user.name
    );
    const isAdmin = session.user.role === "ADMIN";

    const body = await req.json();
    const parsed = createBookingSchema.parse(body);

    const startTime = new Date(parsed.startTime);
    const endTime = new Date(parsed.endTime);
    if (endTime <= startTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    let targetUserId = currentUser.id;
    if (parsed.userId && isAdmin) {
      targetUserId = parsed.userId;
    } else if (parsed.userId && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (parsed.projectId) {
      const project = await db.project.findFirst({
        where: { id: parsed.projectId, userId: targetUserId },
      });
      if (!project) {
        return NextResponse.json(
          { error: "Project not found or access denied" },
          { status: 400 }
        );
      }
    }

    const booking = await db.booking.create({
      data: {
        userId: targetUserId,
        projectId: parsed.projectId ?? null,
        title: parsed.title,
        description: parsed.description ?? null,
        startTime,
        endTime,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    // Send confirmation email
    if (booking.user?.email && !booking.user.email.endsWith("@placeholder.local")) {
      await sendBookingConfirmation({
        to: booking.user.email,
        clientName: booking.user.name || "there",
        bookingTitle: booking.title,
        startTime: booking.startTime,
        endTime: booking.endTime,
        projectName: booking.project?.name,
        description: booking.description ?? undefined,
      }).catch(err => console.error("Failed to send booking confirmation email:", err));
    }

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
    console.error("Error creating booking:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create booking: ${message}` },
      { status: 500 }
    );
  }
}
