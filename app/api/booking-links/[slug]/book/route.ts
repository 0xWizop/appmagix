import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bookSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  guestName: z.string().min(1).max(200),
  guestEmail: z.string().email(),
});

/** POST: public – book a slot (creates guest user and booking) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const link = await db.bookingLink.findUnique({
      where: { slug: slug.toLowerCase(), active: true },
    });
    if (!link) {
      return NextResponse.json({ error: "Booking link not found" }, { status: 404 });
    }

    const body = await req.json();
    const { startTime, endTime, guestName, guestEmail } = bookSchema.parse(body);

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return NextResponse.json({ error: "Invalid time range" }, { status: 400 });
    }
    const durationMs = (link.durationMinutes || 30) * 60 * 1000;
    if (end.getTime() - start.getTime() !== durationMs) {
      return NextResponse.json({ error: "Slot duration does not match link" }, { status: 400 });
    }

    const conflicting = await db.booking.findFirst({
      where: {
        status: "SCHEDULED",
        OR: [
          { userId: link.ownerId },
          { bookingLinkId: link.id },
          { bookingLink: { ownerId: link.ownerId } },
        ],
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (conflicting) {
      return NextResponse.json({ error: "This slot is no longer available" }, { status: 409 });
    }

    let guest = await db.user.findUnique({ where: { email: guestEmail } });
    if (!guest) {
      guest = await db.user.create({
        data: {
          email: guestEmail,
          name: guestName.trim() || null,
        },
      });
    }

    const booking = await db.booking.create({
      data: {
        userId: guest.id,
        bookingLinkId: link.id,
        title: link.title,
        startTime: start,
        endTime: end,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        bookingLink: { select: { id: true, title: true, slug: true } },
      },
    });

    return NextResponse.json({
      booking: {
        id: booking.id,
        title: booking.title,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        user: booking.user,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("Book POST:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
