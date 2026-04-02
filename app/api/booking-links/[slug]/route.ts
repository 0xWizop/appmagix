import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: public – get booking link info by slug */
export async function GET(
  _req: NextRequest,
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
    return NextResponse.json({
      id: link.id,
      title: link.title,
      slug: link.slug,
      durationMinutes: link.durationMinutes,
    });
  } catch (error) {
    console.error("Booking link GET:", error);
    return NextResponse.json({ error: "Failed to fetch link" }, { status: 500 });
  }
}
