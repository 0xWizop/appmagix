import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { getDashboardDataFromPrisma } from "@/lib/db-dashboard";
import { getSitesByOwner } from "@/lib/firestore";
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
  BarChart3,
  FileText,
  AlertCircle,
  CheckCircle2,
  FilePlus2,
} from "lucide-react";

const quickActions = [
  { title: "Request Work", description: "Submit a new project or change request", icon: FilePlus2, href: "/dashboard/web2/intake" },
  { title: "View Projects", description: "Check your project progress", icon: FolderKanban, href: "/dashboard/web2/projects" },
  { title: "Support", description: "Open a support ticket", icon: MessageSquare, href: "/dashboard/web2/support/new" },
  { title: "Analytics", description: "View your site traffic", icon: BarChart3, href: "/dashboard/web2/analytics" },
  { title: "Billing", description: "Invoices and payment history", icon: CreditCard, href: "/dashboard/web2/billing" },
];

const activityIcons = {
  project: FolderKanban,
  ticket: MessageSquare,
  invoice: CreditCard,
  milestone: CheckCircle2,
};

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
  let sitesCount = 0;

  if (userId) {
    try {
      await getOrCreateUserByFirebaseUid(userId, session?.user?.email ?? null, session?.user?.name ?? null);
      const [dashRes, sitesRes] = await Promise.allSettled([
        getDashboardDataFromPrisma(userId),
        getSitesByOwner(userId),
      ]);
      dashboardData = dashRes.status === "fulfilled" ? dashRes.value : null;
      const sitesVal = sitesRes.status === "fulfilled" ? sitesRes.value : null;
      sitesCount = Array.isArray(sitesVal) ? sitesVal.length : 0;
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

  // Primary (most recent) project for the progress hero
  const primaryProject = dashboardData?.projects?.[0];
  const primaryProgress = primaryProject ? getProgress(primaryProject.milestones) : 0;
  const statusLabel = primaryProject ? (statusLabels[primaryProject.status] ?? primaryProject.status) : "";

  return (
    <PageMotion>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-medium">Dashboard</h1>
          <p className="text-text-secondary">
            Welcome back, {session?.user?.name?.split(" ")[0] || session?.user?.email?.split("@")[0] || "there"}
          </p>
        </div>

        {/* Progress hero — primary project */}
        {primaryProject && (
          <Link href={`/dashboard/web2/projects/${primaryProject.id}`} className="block">
            <div className="relative overflow-hidden rounded-2xl border border-brand-green/30 bg-gradient-to-br from-brand-green/10 via-surface to-surface p-6 hover:border-brand-green/50 transition-colors">
              <div className="absolute -top-16 -right-16 h-48 w-48 bg-brand-green/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="text-xs text-brand-green uppercase tracking-wider font-medium mb-1">
                    {statusLabel}
                  </div>
                  <h2 className="text-xl font-semibold">{primaryProject.name}</h2>
                  <p className="text-sm text-text-secondary mt-1">
                    {primaryProgress === 100
                      ? "Your project is launched 🚀"
                      : `Your project is ${primaryProgress}% of the way to launch`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-4xl font-bold text-brand-green tabular-nums">{primaryProgress}%</div>
                </div>
              </div>
              <div className="relative mt-4 h-2.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-green-dark to-brand-green rounded-full transition-all duration-700"
                  style={{ width: `${primaryProgress}%` }}
                />
              </div>
            </div>
          </Link>
        )}

        {/* Stats */}
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
                    View details <ArrowRight className="ml-1 h-3 w-3" />
                  </span>
                </GlassCardContent>
              </GlassCard>
            </Link>
          ))}
        </div>

        {/* Needs attention */}
        {dashboardData?.needAttention && dashboardData.needAttention.length > 0 && (
          <Card className="border-amber-600 bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Needs attention
              </CardTitle>
              <CardDescription className="text-xs">Invoices to pay or open tickets</CardDescription>
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
                      {item.meta && <span className="text-xs text-text-muted shrink-0">{item.meta}</span>}
                      <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-brand-green shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Projects + Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Your Projects</CardTitle>
                <CardDescription className="text-xs">Current project status</CardDescription>
              </div>
              <Link href="/dashboard/web2/projects" className="text-xs text-brand-green hover:underline inline-flex items-center">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              {dashboardData?.projects && dashboardData.projects.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.projects.slice(0, 3).map((project) => {
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
                          <div className="h-full bg-brand-green rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-text-muted mb-2">No projects yet</p>
                  <Link href="/dashboard/web2/intake" className="text-xs text-brand-green hover:underline">
                    Request a build
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.slice(0, 5).map((activity) => {
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
        <div>
          <h2 className="text-sm font-medium text-text-secondary mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickActions.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="p-4 rounded-xl border border-border bg-surface hover:border-brand-green/50 transition-all group"
              >
                <item.icon className="h-5 w-5 text-brand-green mb-2" />
                <div className="font-medium text-sm">{item.title}</div>
                <div className="text-[10px] text-text-muted mt-0.5">{item.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageMotion>
  );
}
