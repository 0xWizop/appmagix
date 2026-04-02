import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, hyphens only"),
  durationMinutes: z.number().int().min(15).max(240).default(30),
});

/** GET: list my booking links */
export async function GET() {
  try {
    if (!db?.bookingLink) {
      console.error("Prisma client missing bookingLink. Run: npx prisma generate");
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
    const links = await db.bookingLink.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      links: links.map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        durationMinutes: l.durationMinutes,
        active: l.active,
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Booking links GET:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to fetch links: ${message}` }, { status: 500 });
  }
}

/** POST: create a booking link */
export async function POST(req: NextRequest) {
  try {
    if (!db?.bookingLink) {
      console.error("Prisma client missing bookingLink. Run: npx prisma generate");
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
    const body = await req.json();
    const { title, slug, durationMinutes } = createSchema.parse(body);
    const existing = await db.bookingLink.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "This slug is already in use" }, { status: 400 });
    }
    const link = await db.bookingLink.create({
      data: {
        ownerId: user.id,
        title,
        slug: slug.toLowerCase(),
        durationMinutes: durationMinutes ?? 30,
      },
    });
    return NextResponse.json({
      link: {
        id: link.id,
        title: link.title,
        slug: link.slug,
        durationMinutes: link.durationMinutes,
        active: link.active,
        createdAt: link.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("Booking links POST:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to create link: ${message}` }, { status: 500 });
  }
}
