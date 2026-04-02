import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { hasActiveSubscription } from "@/lib/subscription";
import { getProjectsByOwner, getSitesByOwner, getAnalyticsForProject, getAnalyticsForSite } from "@/lib/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { AnalyticsCharts } from "./analytics-charts";
import { SourceSelector } from "./source-selector";
import { AnalyticsToolbar } from "./analytics-toolbar";
import { AddSiteForm } from "@/components/dashboard/add-site-form";
import { SubscriptionGate } from "@/components/dashboard/subscription-gate";
import { BarChart3, Eye, FileText } from "lucide-react";
import { PageTips } from "@/components/dashboard/page-tips";

interface AnalyticsPageProps {
  searchParams: Promise<{ source?: string; project?: string; days?: string }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const session = await getSession();
  const userId = session?.user?.id;
  let prismaUser: { id: string } | null = null;
  let canAccess = false;
  if (userId) {
    try {
      prismaUser = await getOrCreateUserByFirebaseUid(
        userId,
        session?.user?.email ?? null,
        session?.user?.name ?? null
      );
      canAccess = await hasActiveSubscription(prismaUser.id);
    } catch (error) {
      console.error("Analytics subscription check failed:", error);
      canAccess = false;
    }
  }
  if (!canAccess) {
    return <SubscriptionGate title="Sites & Analytics" />;
  }

  const { source: sourceParam, project: projectIdLegacy, days: daysParam } = await searchParams;
  const days = Math.min(90, Math.max(7, parseInt(daysParam || "30", 10) || 30));

  let projects: Awaited<ReturnType<typeof getProjectsByOwner>> = [];
  let sites: Awaited<ReturnType<typeof getSitesByOwner>> = [];
  let analytics = null;
  let selectedName = "";
  let selectedValue = "";

  if (userId) {
    try {
      [projects, sites] = await Promise.all([
        getProjectsByOwner(userId),
        getSitesByOwner(userId),
      ]);
      const connectedProjects = projects.filter((p) => p.websiteUrl);

      const source = sourceParam || (projectIdLegacy ? `project:${projectIdLegacy}` : null) ||
        (connectedProjects[0] ? `project:${connectedProjects[0].id}` : null) ||
        (sites[0] ? `site:${sites[0].id}` : null);

      if (source) {
        const [type, id] = source.split(":");
        if (type === "project" && id) {
          const proj = projects.find((p) => p.id === id);
          if (proj) {
            selectedName = proj.name;
            selectedValue = source;
            analytics = await getAnalyticsForProject(id, userId, days);
          }
        } else if (type === "site" && id) {
          const site = sites.find((s) => s.id === id);
          if (site) {
            selectedName = site.domain;
            selectedValue = source;
            analytics = await getAnalyticsForSite(id, userId, days);
          }
        }
      }
    } catch (e) {
      console.error("Analytics error:", e);
    }
  }

  const connectedProjects = projects.filter((p) => p.websiteUrl);
  const hasAnySource = connectedProjects.length > 0 || sites.length > 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-medium tracking-tight">Sites & Analytics</h1>
        <p className="text-text-secondary text-sm mt-1">Add sites and view traffic and performance.</p>
      </div>
      <PageTips />
      <AddSiteForm />
      {hasAnySource && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SourceSelector
            projects={projects}
            sites={sites}
            selectedValue={selectedValue}
          />
          {selectedName && analytics && (
            <AnalyticsToolbar
              dailyViews={analytics.dailyViews}
              topPaths={analytics.topPaths}
              projectName={selectedName}
            />
          )}
        </div>
      )}

      {!selectedValue ? (
        <Card className="bg-brand-green-dark border-brand-green">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-brand-green-dark flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Connect a site</h3>
            <p className="text-white/80 max-w-md mb-4">
              {!hasAnySource
                ? "Add a site above to start tracking. Paste the meta tag and script on your site, then select it below."
                : "Select a site above to view its analytics."}
            </p>
          </CardContent>
        </Card>
      ) : analytics ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">{analytics.pageViews.toLocaleString()}</p>
                    <p className="text-sm text-text-muted">Page Views ({days} days)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">{analytics.uniquePaths.toLocaleString()}</p>
                    <p className="text-sm text-text-muted">Unique Pages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">
                      {analytics.dailyViews.length > 0
                        ? (
                            analytics.dailyViews.reduce((s, d) => s + d.views, 0) /
                            analytics.dailyViews.length
                          ).toFixed(1)
                        : "0"}
                    </p>
                    <p className="text-sm text-text-muted">Avg. Daily Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <AnalyticsCharts
            dailyViews={analytics.dailyViews}
            topPaths={analytics.topPaths}
          />
        </>
      ) : null}
    </div>
  );
}
