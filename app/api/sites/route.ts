import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getSitesByOwner, createSite } from "@/lib/firestore";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  projectId: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sites = await getSitesByOwner(session.user.id);
  return NextResponse.json({ sites });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { domain, projectId } = createSchema.parse(body);

    const result = await createSite(session.user.id, domain, projectId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      site: result.site,
      token: result.token,
      metaTag: `<meta name="merchantmagix-site" content="${result.token}">`,
      embedScript: `<script async src="${process.env.NEXT_PUBLIC_APP_URL || "https://merchantmagix.com"}/embed.js?token=${result.token}"></script>`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Create site error:", error);
    return NextResponse.json(
      { error: "Failed to create site" },
      { status: 500 }
    );
  }
}
