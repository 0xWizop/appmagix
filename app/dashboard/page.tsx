import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { hasActiveSubscription } from "@/lib/subscription";
import { getDashboardDataFromPrisma } from "@/lib/db-dashboard";
import { getContactsByOwner } from "@/lib/db-contacts";
import { getSitesByOwner, getProjectsByOwner, getAnalyticsForProject, getAnalyticsForSite } from "@/lib/firestore";
import { getTrafficAlerts } from "@/lib/traffic-alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { PageMotion } from "@/components/dashboard/page-motion";
import Link from "next/link";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  FolderKanban,
  MessageSquare,
  CreditCard,
  ArrowRight,
  Clock,
  Package,
  Wrench,
  BarChart3,
  ExternalLink,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { TrafficAlertCard } from "@/components/dashboard/traffic-alert-card";
import { ImproveSuggestionsCard } from "@/components/dashboard/improve-suggestions-card";
import { PinnedNotes } from "@/components/dashboard/pinned-notes";
import { FocusPanel } from "@/components/dashboard/focus-panel";

const quickActions = [
  { title: "View Projects", description: "Check your project progress", icon: FolderKanban, href: "/dashboard/web2/projects" },
  { title: "Start Project", description: "Create a new project", icon: Package, href: "/dashboard/web2/projects/new" },
  { title: "Sites & Analytics", description: "Add sites, view traffic", icon: BarChart3, href: "/dashboard/web2/analytics" },
  { title: "Reports", description: "Export analytics CSV", icon: FileText, href: "/dashboard/web2/reports" },
  { title: "Support", description: "Create a support ticket", icon: MessageSquare, href: "/dashboard/web2/support/new" },
  { title: "Billing", description: "Invoices and payment history", icon: CreditCard, href: "/dashboard/web2/billing" },
];

const saasLinks = [
  { name: "Sites & Analytics", description: "Add sites and view traffic", icon: BarChart3, href: "/dashboard/web2/analytics" },
  { name: "Reports", description: "Export analytics as CSV", icon: FileText, href: "/dashboard/web2/reports" },
];

const utilityTools = [
  { name: "File convert", description: "Convert files and media", icon: Wrench, href: "/dashboard/web2/file-convert" },
  { name: "Mini Tools", description: "Handy developer utilities", icon: Wrench, href: "/dashboard/web2/tools" },
];

const activityIcons = {
  project: FolderKanban,
  ticket: MessageSquare,
  invoice: CreditCard,
  milestone: CheckCircle2,
};

const healthConfig = {
  healthy: { label: "On track", color: "bg-brand-green-dark text-white" },
  needs_attention: { label: "Needs attention", color: "bg-amber-600 text-white" },
  overdue: { label: "Overdue", color: "bg-red-600 text-white" },
} as const;

const statusLabels: Record<string, string> = {
  DISCOVERY: "Discovery",
  DESIGN: "Design",
  DEVELOPMENT: "Development",
  REVIEW: "Review",
  LAUNCHED: "Launched",
};

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session?.user?.id;

  let dashboardData = null;
  let contactsCount = 0;
  let hasSubscription = false;
  let sitesCount = 0;
  let trafficAlerts: Awaited<ReturnType<typeof getTrafficAlerts>> = [];
  let improveData: { hasSite: boolean; totalViews14d: number; topPaths: { path: string; count: number }[] } = { hasSite: false, totalViews14d: 0, topPaths: [] };
  if (userId) {
    try {
      let prismaUserId = "";
      try {
        const prismaUser = await getOrCreateUserByFirebaseUid(userId, session?.user?.email ?? null, session?.user?.name ?? null);
        prismaUserId = prismaUser.id;
      } catch (dbErr) {
        console.error("[Dashboard] Critical Prisma Database Error:", dbErr);
        // Dashboard will render in a fall-back state since dashboardData relies on Prisma succeeding above
      }
      
      console.log("[Dashboard] Starting data fetch for user:", session.user.id);
      const [dashRes, contactsRes, subActive, sites, alertsRes] = await Promise.allSettled([
        getDashboardDataFromPrisma(userId),
        getContactsByOwner(userId),
        prismaUserId ? hasActiveSubscription(prismaUserId) : Promise.resolve(false),
        getSitesByOwner(userId),
        getTrafficAlerts(userId).catch(() => []),
      ]);

      if (dashRes.status === 'rejected') console.error("[Dashboard] getDashboardDataFromPrisma failed:", dashRes.reason);
      if (contactsRes.status === 'rejected') console.error("[Dashboard] getContactsByOwner failed:", contactsRes.reason);
      if (subActive.status === 'rejected') console.error("[Dashboard] hasActiveSubscription failed:", subActive.reason);
      if (sites.status === 'rejected') console.error("[Dashboard] getSitesByOwner failed:", sites.reason);
      if (alertsRes.status === 'rejected') console.error("[Dashboard] getTrafficAlerts failed:", alertsRes.reason);

      dashboardData = dashRes?.status === "fulfilled" ? dashRes.value : null;
      contactsCount = contactsRes?.status === "fulfilled" ? (contactsRes.value?.length ?? 0) : 0;
      hasSubscription = subActive?.status === "fulfilled" ? subActive.value : false;
      const sitesVal = sites?.status === "fulfilled" ? sites.value : null;
      const alertsVal = alertsRes?.status === "fulfilled" ? alertsRes.value : [];
      sitesCount = Array.isArray(sitesVal) ? sitesVal.length : 0;
      trafficAlerts = Array.isArray(alertsVal) ? alertsVal : [];
      console.log("[Dashboard] Initial data fetch complete. DashboardData:", !!dashboardData, "ContactsCount:", contactsCount, "HasSubscription:", hasSubscription, "SitesCount:", sitesCount, "TrafficAlerts:", trafficAlerts.length);

      if (hasSubscription && (sitesCount > 0 || (dashboardData?.projects ?? []).some((p) => p.websiteUrl))) {
        const projects = await getProjectsByOwner(userId).catch(() => []);
        const connected = projects.filter((p) => p.websiteUrl);
        const sources = [...connected.map((p) => ({ type: "project" as const, id: p.id })), ...(sitesVal || []).map((s) => ({ type: "site" as const, id: s.id }))];
        let totalViews = 0;
        const allTopPaths: { path: string; count: number }[] = [];
        for (const src of sources.slice(0, 3)) {
          const data = src.type === "project" ? await getAnalyticsForProject(src.id, userId, 14).catch(() => null) : await getAnalyticsForSite(src.id, userId, 14).catch(() => null);
          if (data) {
            totalViews += data.pageViews;
            allTopPaths.push(...data.topPaths.slice(0, 5));
          }
        }
        allTopPaths.sort((a, b) => b.count - a.count);
        improveData = { hasSite: true, totalViews14d: totalViews, topPaths: allTopPaths.slice(0, 5) };
      }
    } catch (e) {
      console.error("Dashboard data error:", e);
    }
  }

  const stats = dashboardData
    ? [
        {
          title: "Active Projects",
          value: String(dashboardData.projectCount),
          description: `${dashboardData.projectsInDevelopment} in development`,
          icon: FolderKanban,
          href: "/dashboard/web2/projects",
        },
        {
          title: "Open Tickets",
          value: String(dashboardData.openTicketCount),
          description: dashboardData.openTicketCount === 1 ? "Awaiting response" : "Need attention",
          icon: MessageSquare,
          href: "/dashboard/web2/support",
        },
        {
          title: "Pending Invoices",
          value: formatCurrency(dashboardData.pendingInvoiceTotal / 100),
          description: dashboardData.pendingInvoiceTotal === 0 ? "All paid" : "Action required",
          icon: CreditCard,
          href: "/dashboard/web2/billing",
        },
      ]
    : [];

  const getProgress = (milestones: { status?: string }[]) => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter((m) => m.status === "COMPLETED").length;
    return Math.round((completed / milestones.length) * 100);
  };

  const hasProject = (dashboardData?.projectCount ?? 0) > 0;
  const hasConnectedSite = (dashboardData?.projects ?? []).some((p) => p.websiteUrl);
  const hasSite = hasConnectedSite || sitesCount > 0;
  const hasContact = contactsCount > 0;
  const hasPendingInvoice = (dashboardData?.pendingInvoiceTotal ?? 0) > 0;

  return (
    <PageMotion>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 space-y-8 min-w-0">
            <div>
              <h1 className="text-2xl font-medium">Dashboard</h1>
              <p className="text-text-secondary">
                Welcome back, {session?.user?.name?.split(" ")[0] || session?.user?.email?.split("@")[0] || "there"}
              </p>
            </div>

            {/* Stats Grid — real user data */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat) => (
                <Link key={stat.title} href={stat.href}>
                  <GlassCard className="group hover:border-brand-green transition-colors hover:bg-brand-green/10">
                    <GlassCardHeader className="flex flex-row items-center justify-between pb-2">
                      <GlassCardTitle className="text-sm font-medium text-text-secondary group-hover:text-white">
                        {stat.title}
                      </GlassCardTitle>
                      <stat.icon className="h-5 w-5 text-text-muted group-hover:text-white" />
                    </GlassCardHeader>
                    <GlassCardContent>
                      <div className="text-2xl font-medium group-hover:text-white">{stat.value}</div>
                      <p className="text-xs text-text-muted mt-1 group-hover:text-white/80">{stat.description}</p>
                      <span className="text-xs text-brand-green group-hover:text-white hover:underline mt-2 inline-flex items-center">
                        View details
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </span>
                    </GlassCardContent>
                  </GlassCard>
                </Link>
              ))}
            </div>

            {/* Need attention — invoices, tickets, overdue milestones */}
            {dashboardData?.needAttention && dashboardData.needAttention.length > 0 && (
              <Card className="border-amber-600 bg-surface">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    Need attention
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Invoices to pay, open tickets, or overdue milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {dashboardData.needAttention.slice(0, 4).map((item) => (
                      <li key={`${item.type}-${item.id}`}>
                        <Link
                          href={item.href}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border hover:border-brand-green hover:bg-surface-hover transition-colors group"
                        >
                          <span className="text-sm font-medium truncate">{item.title}</span>
                          {item.meta && (
                            <span className="text-xs text-text-muted shrink-0">{item.meta}</span>
                          )}
                          <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-brand-green shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Main Sections Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Projects Preview */}
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Your Projects</CardTitle>
                    <CardDescription className="text-xs">Current project status overview</CardDescription>
                  </div>
                  <Link href="/dashboard/web2/projects" className="text-xs text-brand-green hover:underline inline-flex items-center">
                    View All
                  </Link>
                </CardHeader>
                <CardContent>
                  {dashboardData?.projects && dashboardData.projects.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.projects.slice(0, 2).map((project) => {
                        const progress = getProgress(project.milestones);
                        return (
                          <Link
                            key={project.id}
                            href={`/dashboard/web2/projects/${project.id}`}
                            className="block border border-border rounded-lg p-3 hover:border-brand-green hover:bg-surface-hover transition-all"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="text-sm font-medium">{project.name}</h3>
                              <span className="text-[10px] bg-surface px-1.5 py-0.5 rounded text-text-muted">
                                {statusLabels[project.status] ?? project.status}
                              </span>
                            </div>
                            <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-green rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs text-text-muted mb-2">No projects yet</p>
                      <Link href="/dashboard/web2/projects/new" className="text-xs text-brand-green hover:underline">
                        Create a project
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                    dashboardData.recentActivity.slice(0, 4).map((activity) => {
                      const Icon = activityIcons[activity.type as keyof typeof activityIcons] ?? FolderKanban;
                      return (
                        <div key={activity.id} className="flex items-start gap-3">
                          <Icon className="h-4 w-4 text-text-muted mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-text-primary truncate">{activity.message}</p>
                            <p className="text-[10px] text-text-muted">{formatRelativeTime(activity.date)}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-text-muted text-center py-4">No recent activity</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.slice(0, 6).map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="p-4 rounded-xl border border-border bg-surface hover:border-brand-green/50 transition-all group"
                >
                  <item.icon className="h-5 w-5 text-brand-green mb-2" />
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-[10px] text-text-muted">{item.description}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar / Tracker Area */}
          <div className="w-full xl:w-80 flex flex-col gap-6">
            <OnboardingChecklist
              hasProject={hasProject}
              hasConnectedSite={hasConnectedSite}
              hasContact={hasContact}
              hasPendingInvoice={hasPendingInvoice}
              hasSubscription={hasSubscription}
              hasSite={hasSite}
              compact
            />

            <TrafficAlertCard alerts={trafficAlerts} />

            <Card className="border-border p-5">
              <FocusPanel />
            </Card>

            <Card className="border-border p-5">
              <PinnedNotes />
            </Card>
          </div>
        </div>
      </div>
    </PageMotion>
  );
}
