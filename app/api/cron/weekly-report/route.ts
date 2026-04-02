import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProjectsByOwner, getSitesByOwner, getAnalyticsForProject, getAnalyticsForSite } from "@/lib/firestore";
import { getTrafficAlerts } from "@/lib/traffic-alert";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || "MerchantMagix <noreply@merchantmagix.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://merchantmagix.com";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || req.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}` && auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resend) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 500 });
  }

  const DAYS = 7;
  const subs = await db.subscription.findMany({
    where: {
      status: { in: ["active", "trialing"] },
      currentPeriodEnd: { gte: new Date() },
    },
    include: { user: true },
  });

  let sent = 0;
  for (const sub of subs) {
    const user = sub.user;
    if (!user.email || user.email.endsWith("@placeholder.local") || !user.firebaseUid) continue;

    const ownerId = user.firebaseUid;
    const [projects, sites] = await Promise.all([
      getProjectsByOwner(ownerId),
      getSitesByOwner(ownerId),
    ]);
    const connectedProjects = projects.filter((p) => p.websiteUrl);
    const sources: { name: string; type: "project" | "site"; id: string }[] = [
      ...connectedProjects.map((p) => ({ name: p.name, type: "project" as const, id: p.id })),
      ...sites.map((s) => ({ name: s.domain, type: "site" as const, id: s.id })),
    ];

    if (sources.length === 0) continue;

    const summaries: { name: string; pageViews: number; topPath: string; topViews: number }[] = [];
    for (const src of sources.slice(0, 5)) {
      const analytics =
        src.type === "project"
          ? await getAnalyticsForProject(src.id, ownerId, DAYS)
          : await getAnalyticsForSite(src.id, ownerId, DAYS);
      const top = analytics.topPaths[0];
      summaries.push({
        name: src.name,
        pageViews: analytics.pageViews,
        topPath: top?.path ?? "—",
        topViews: top?.count ?? 0,
      });
    }

    const totalViews = summaries.reduce((s, x) => s + x.pageViews, 0);
    const trafficAlerts = await getTrafficAlerts(ownerId).catch(() => []);
    const trafficAlertBlock =
      trafficAlerts.length > 0
        ? `
        <div style="margin: 1rem 0; padding: 1rem; border: 1px solid #d97706; border-radius: 8px; background: #fffbeb;">
          <strong style="color: #b45309;">Traffic alert</strong>
          <p style="margin: 0.5rem 0 0 0; font-size: 14px;">Traffic is down compared to the previous week on:</p>
          <ul style="margin: 0.5rem 0 0 1rem; padding: 0;">
            ${trafficAlerts.map((a) => `<li>${a.sourceName}: ${a.currentViews} views (was ${a.previousViews}) — down ${Math.abs(Math.round(a.percentChange))}%</li>`).join("")}
          </ul>
          <p style="margin: 0.5rem 0 0 0;"><a href="${APP_URL}/dashboard/web2/analytics" style="color: #0f766e;">View Sites & Analytics →</a></p>
        </div>
        `
        : "";

    const html = `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #0f766e;">Your weekly analytics</h2>
        <p>Hi${user.name ? ` ${user.name.split(" ")[0]}` : ""}, here’s your Sites & Analytics summary for the last ${DAYS} days.</p>
        ${trafficAlertBlock}
        <p><strong>Total page views:</strong> ${totalViews.toLocaleString()}</p>
        ${summaries.map((s) => `
          <div style="margin: 1rem 0; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
            <strong>${s.name}</strong><br/>
            Page views: ${s.pageViews.toLocaleString()}<br/>
            Top page: ${s.topPath} (${s.topViews} views)
          </div>
        `).join("")}
        <p><a href="${APP_URL}/dashboard/web2/analytics" style="color: #0f766e;">View full analytics →</a></p>
        <p style="color: #6b7280; font-size: 12px;">You’re receiving this because you’re subscribed to MerchantMagix SaaS.</p>
      </div>
    `;

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: user.email,
        subject: `Your weekly analytics — ${totalViews.toLocaleString()} page views`,
        html,
      });
      sent++;
    } catch (e) {
      console.error("Weekly report send failed for", user.email, e);
    }
  }

  return NextResponse.json({ ok: true, sent, total: subs.length });
}
