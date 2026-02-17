import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { updateProjectSite } from "@/lib/firestore";
import { z } from "zod";

export const dynamic = "force-dynamic";

const connectSchema = z.object({
  websiteUrl: z.string().min(1, "Site URL is required"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await req.json();
    const { websiteUrl } = connectSchema.parse(body);

    const raw = websiteUrl.trim();
    const url = raw.startsWith("http") ? raw : `https://${raw}`;
    const result = await updateProjectSite(projectId, session.user.id, url);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      token: result.token,
      websiteUrl: url,
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
    console.error("Connect site error:", error);
    return NextResponse.json(
      { error: "Failed to connect site" },
      { status: 500 }
    );
  }
}
