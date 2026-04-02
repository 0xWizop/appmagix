import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { sendBookingConfirmation } from "@/lib/email";

export const dynamic = "force-dynamic";

const schema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  startTime: z.string().refine((s) => !Number.isNaN(Date.parse(s))),
  endTime: z.string().refine((s) => !Number.isNaN(Date.parse(s))),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, name, email, startTime, endTime } = schema.parse(body);

    const link = await db.bookingLink.findUnique({
      where: { slug },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    if (!link || !link.active) {
      return NextResponse.json({ error: "Booking link not found or inactive" }, { status: 404 });
    }

    // Create or find guest user by email
    const safeEmail = email.trim().toLowerCase();
    let guestUser = await db.user.findUnique({ where: { email: safeEmail } });
    
    if (!guestUser) {
      guestUser = await db.user.create({
        data: {
          email: safeEmail,
          name: name.trim(),
          firebaseUid: `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        },
      });
    } else if (!guestUser.name) {
      guestUser = await db.user.update({
        where: { id: guestUser.id },
        data: { name: name.trim() },
      });
    }

    // Create the booking
    const booking = await db.booking.create({
      data: {
        userId: guestUser.id,
        bookingLinkId: link.id,
        title: `Meeting: ${name.trim()} / ${link.owner.name || 'Host'}`,
        description: `Booked via public link: ${link.title}`,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "SCHEDULED",
      },
    });

    // Notify guest
    await sendBookingConfirmation({
      to: safeEmail,
      clientName: name.trim(),
      bookingTitle: link.title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    }).catch(console.error);

    // Notify host
    if (link.owner.email && !link.owner.email.endsWith('@placeholder.local')) {
      await sendBookingConfirmation({
        to: link.owner.email,
        clientName: link.owner.name || "Host",
        bookingTitle: `NEW BOOKING: ${name.trim()}`,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      }).catch(console.error);
    }

    return NextResponse.json({ ok: true, bookingId: booking.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("[public-bookings POST]", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
