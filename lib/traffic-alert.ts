import { getProjectsByOwner, getSitesByOwner, getAnalyticsForProject, getAnalyticsForSite } from "@/lib/firestore";

const DROPDOWN_THRESHOLD_PERCENT = 20; // alert when traffic drops by this much
const DAYS = 7;

export interface TrafficAlert {
  sourceName: string;
  sourceType: "project" | "site";
  currentViews: number;
  previousViews: number;
  percentChange: number;
}

function sumDailyViews(dailyViews: { date: string; views: number }[]): number {
  return dailyViews.reduce((s, d) => s + d.views, 0);
}

/**
 * Compare last 7 days vs previous 7 days. Returns alerts when traffic dropped by threshold.
 */
export async function getTrafficAlerts(firebaseUid: string): Promise<TrafficAlert[]> {
  const [projects, sites] = await Promise.all([
    getProjectsByOwner(firebaseUid),
    getSitesByOwner(firebaseUid),
  ]);
  const connectedProjects = projects.filter((p) => p.websiteUrl);
  const sources: { name: string; type: "project" | "site"; id: string }[] = [
    ...connectedProjects.map((p) => ({ name: p.name, type: "project" as const, id: p.id })),
    ...sites.map((s) => ({ name: s.domain, type: "site" as const, id: s.id })),
  ];

  const alerts: TrafficAlert[] = [];
  const fourteenDays = await Promise.all(
    sources.slice(0, 10).map(async (src) => {
      const data =
        src.type === "project"
          ? await getAnalyticsForProject(src.id, firebaseUid, 14)
          : await getAnalyticsForSite(src.id, firebaseUid, 14);
      return { src, dailyViews: data.dailyViews };
    })
  );

  const now = new Date();
  const cutoffCurrent = new Date(now);
  cutoffCurrent.setDate(cutoffCurrent.getDate() - DAYS);
  cutoffCurrent.setHours(0, 0, 0, 0);
  const cutoffPrevious = new Date(cutoffCurrent);
  cutoffPrevious.setDate(cutoffPrevious.getDate() - DAYS);

  for (const { src, dailyViews } of fourteenDays) {
    let currentViews = 0;
    let previousViews = 0;
    const cutoffCurrentStr = cutoffCurrent.toISOString().slice(0, 10);
    const cutoffPreviousStr = cutoffPrevious.toISOString().slice(0, 10);
    for (const d of dailyViews) {
      if (d.date >= cutoffCurrentStr) currentViews += d.views;
      else if (d.date >= cutoffPreviousStr) previousViews += d.views;
    }
    if (previousViews < 10) continue; // not enough history to be meaningful
    const percentChange = previousViews === 0 ? 0 : ((currentViews - previousViews) / previousViews) * 100;
    if (percentChange <= -DROPDOWN_THRESHOLD_PERCENT) {
      alerts.push({
        sourceName: src.name,
        sourceType: src.type,
        currentViews,
        previousViews,
        percentChange,
      });
    }
  }

  return alerts;
}
