import { NextRequest, NextResponse } from "next/server";
import { ingestAnalyticsEvent } from "@/lib/firestore";
import { z } from "zod";

export const dynamic = "force-dynamic";

const eventSchema = z.object({
  token: z.string().min(1),
  type: z.enum(["page_view", "custom"]).default("page_view"),
  path: z.string().max(500).optional().default("/"),
  referrer: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = eventSchema.parse(body);

    const result = await ingestAnalyticsEvent({
      projectToken: parsed.token,
      type: parsed.type,
      path: parsed.path,
      referrer: parsed.referrer,
      metadata: parsed.metadata,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Invalid" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Analytics ingest error:", error);
    return NextResponse.json(
      { error: "Failed to record event" },
      { status: 500 }
    );
  }
}
