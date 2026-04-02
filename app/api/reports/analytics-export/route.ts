import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { hasActiveSubscription } from "@/lib/subscription";
import { getAnalyticsForProject, getAnalyticsForSite } from "@/lib/firestore";
import { getProjectsByOwner, getSitesByOwner } from "@/lib/firestore";

export const dynamic = "force-dynamic";

function escapeCsvCell(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await getOrCreateUserByFirebaseUid(
      session.user.id,
      session.user.email ?? null,
      session.user.name ?? null
    );
    if (!(await hasActiveSubscription(user.id))) {
      return NextResponse.json({ error: "Subscription required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const source = searchParams.get("source");
    const days = Math.min(90, Math.max(1, parseInt(searchParams.get("days") || "30", 10) || 30));

    if (!source || !source.includes(":")) {
      return NextResponse.json({ error: "Missing or invalid source" }, { status: 400 });
    }

    const [type, id] = source.split(":");
    let name = "";
    let analytics: Awaited<ReturnType<typeof getAnalyticsForProject>> | null = null;

    if (type === "project" && id) {
      const projects = await getProjectsByOwner(session.user.id);
      const proj = projects.find((p) => p.id === id);
      if (!proj) return NextResponse.json({ error: "Project not found" }, { status: 404 });
      name = proj.name;
      analytics = await getAnalyticsForProject(id, session.user.id, days);
    } else if (type === "site" && id) {
      const sites = await getSitesByOwner(session.user.id);
      const site = sites.find((s) => s.id === id);
      if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
      name = site.domain;
      analytics = await getAnalyticsForSite(id, session.user.id, days);
    } else {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    if (!analytics) {
      return NextResponse.json({ error: "No data" }, { status: 404 });
    }

    const rows: string[][] = [
      ["Sites & Analytics Report", ""],
      ["Source", name],
      ["Period", `${days} days`],
      ["Total page views", String(analytics.pageViews)],
      ["Unique pages", String(analytics.uniquePaths)],
      [],
      ["Date", "Page views"],
      ...analytics.dailyViews.map((d) => [d.date, String(d.views)]),
      [],
      ["Path", "Views"],
      ...analytics.topPaths.map((p) => [p.path, String(p.count)]),
    ];

    const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
    const filename = `analytics-${name.replace(/[^a-z0-9.-]/gi, "-")}-${days}d.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Analytics export error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate report: ${message}` },
      { status: 500 }
    );
  }
}
