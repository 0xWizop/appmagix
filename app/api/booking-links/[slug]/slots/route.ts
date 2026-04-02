import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addDays, setHours, setMinutes, startOfDay, addMinutes } from "date-fns";

export const dynamic = "force-dynamic";

/** GET: public – get available time slots for this booking link. Query: start (ISO date), end (ISO date). */
export async function GET(
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

    const { searchParams } = new URL(req.url);
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    const rangeStart = startParam ? startOfDay(new Date(startParam)) : startOfDay(new Date());
    const rangeEnd = endParam ? startOfDay(new Date(endParam)) : addDays(rangeStart, 14);

    const slotDuration = link.durationMinutes;
    const dayStartHour = 9;
    const dayEndHour = 17;
    const slots: { start: string; end: string }[] = [];

    for (let d = new Date(rangeStart); d < rangeEnd; d = addDays(d, 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      let slotStart = setMinutes(setHours(new Date(d), dayStartHour), 0);
      const dayEnd = setMinutes(setHours(new Date(d), dayEndHour), 0);
      while (slotStart < dayEnd) {
        const slotEnd = addMinutes(slotStart, slotDuration);
        if (slotEnd <= dayEnd) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
          });
        }
        slotStart = addMinutes(slotStart, slotDuration);
      }
    }

    const hostBookings = await db.booking.findMany({
      where: {
        status: "SCHEDULED",
        OR: [
          { userId: link.ownerId },
          { bookingLinkId: link.id },
          { bookingLink: { ownerId: link.ownerId } },
        ],
        startTime: { lt: rangeEnd },
        endTime: { gt: rangeStart },
      },
      select: { startTime: true, endTime: true },
    });

    const available = slots.filter((slot) => {
      const s = new Date(slot.start);
      const e = new Date(slot.end);
      const overlaps = hostBookings.some(
        (b) => s < b.endTime && e > b.startTime
      );
      return !overlaps && s > new Date();
    });

    return NextResponse.json({ slots: available });
  } catch (error) {
    console.error("Slots GET:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}
