import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().optional(),
  type: z.enum(["SHOPIFY", "CUSTOM"]).default("CUSTOM"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ projects: [] }, { status: 200 });
    }

    const user = await getOrCreateUserByFirebaseUid(
      session.user.id,
      session.user.email,
      session.user.name
    );
    const projects = await db.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, type: true, status: true, description: true },
    });
    return NextResponse.json({
      projects: projects.map((p) => ({ id: p.id, name: p.name, type: p.type, status: p.status, description: p.description })),
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    // For dashboard selects, prefer returning an empty list instead of a hard failure.
    return NextResponse.json({ projects: [] }, { status: 200 });
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
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const { name, description, type } = parsed.data;

    const project = await db.project.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        type: type || "CUSTOM",
      },
    });

    return NextResponse.json(
      {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          type: project.type,
          status: project.status,
          createdAt: project.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
