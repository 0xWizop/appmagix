import { NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { createIntake, getIntakesByUser, getIntakesForAdmin } from "@/lib/firestore";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createIntakeSchema = z.object({
  projectType: z.string().min(1, "Project type is required"),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  goals: z.string().optional(),
  scope: z.string().optional(),
  features: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  contactName: z.string().min(1, "Name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const isAdmin = session.user.role === "ADMIN";
    const intakes = isAdmin
      ? await getIntakesForAdmin()
      : await getIntakesByUser(session.user.id);
    return NextResponse.json(intakes);
  } catch (error) {
    console.error("Intakes fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch intakes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createIntakeSchema.parse(body);

    const session = await getSession();
    const ownerId = session?.user?.id ?? null;

    const intake = await createIntake({
      ...parsed,
      ownerId,
    });

    return NextResponse.json(intake);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Intake create error:", error);
    return NextResponse.json({ error: "Failed to create intake" }, { status: 500 });
  }
}
