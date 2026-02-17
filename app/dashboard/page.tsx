import { getSession } from "@/lib/firebase-session";
import { getDashboardData, getContactsByOwner } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Globe,
} from "lucide-react";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";

const quickActions = [
  { title: "Tools", description: "Domain lookups—free", icon: Wrench, href: "/dashboard/web2/tools" },
  { title: "View Projects", description: "Check your project progress", icon: FolderKanban, href: "/dashboard/web2/projects" },
  { title: "Start Project", description: "Submit intake for a new build", icon: Package, href: "/dashboard/web2/intake" },
  { title: "Analytics", description: "View site analytics", icon: BarChart3, href: "/dashboard/web2/analytics" },
  { title: "Support", description: "Create a support ticket", icon: MessageSquare, href: "/dashboard/web2/support/new" },
  { title: "Billing", description: "Invoices and payment history", icon: CreditCard, href: "/dashboard/web2/billing" },
];

const tools = [
  { name: "Domain lookup", description: "Add any domain, get analytics", icon: Globe, href: "/dashboard/web2/tools", available: true },
];

const activityIcons = {
  project: FolderKanban,
  ticket: MessageSquare,
  invoice: CreditCard,
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
  let contactsCount = 0;
  if (userId) {
    try {
      const [dashRes, contactsRes] = await Promise.allSettled([
        getDashboardData(userId),
        getContactsByOwner(userId),
      ]);
      dashboardData = dashRes.status === "fulfilled" ? dashRes.value : null;
      contactsCount = contactsRes.status === "fulfilled" ? contactsRes.value.length : 0;
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
  const hasContact = contactsCount > 0;

  return (
    <PageMotion>
      <div className="p-6 lg:p-8 space-y-8">
        <p className="text-text-secondary">
          Welcome back, {session?.user?.name?.split(" ")[0] || session?.user?.email?.split("@")[0] || "there"}
        </p>

        <OnboardingChecklist
          hasProject={hasProject}
          hasConnectedSite={hasConnectedSite}
          hasContact={hasContact}
        />

        {/* Tools — free lookups, no project required */}
        <Card className="border-brand-green">
          <CardHeader>
            <CardTitle>Free lookups</CardTitle>
            <CardDescription>
              Domain lookups. No project required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              {tools.map((tool) => (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-brand-green hover:bg-surface-hover transition-all group"
                >
                  <div className="h-10 w-10 rounded-lg bg-brand-green-dark flex items-center justify-center group-hover:bg-brand-green transition-colors shrink-0">
                    <tool.icon className="h-5 w-5 text-white group-hover:text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{tool.name}</div>
                    <div className="text-xs text-text-muted">{tool.description}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-brand-green transition-colors shrink-0" />
                </Link>
              ))}
            </div>
            <Link
              href="/dashboard/web2/tools"
              className="mt-4 inline-flex items-center text-sm text-brand-green hover:underline"
            >
              Open Tools
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Stats Grid — real user data */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="group hover:border-brand-green transition-colors hover:bg-brand-green-dark">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-text-secondary group-hover:text-white">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-5 w-5 text-text-muted group-hover:text-white" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-medium group-hover:text-white">{stat.value}</div>
                  <p className="text-xs text-text-muted mt-1 group-hover:text-white/80">{stat.description}</p>
                  <span className="text-xs text-brand-green group-hover:text-white hover:underline mt-2 inline-flex items-center">
                    View details
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks at your fingertips</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-brand-green hover:bg-surface-hover transition-all group"
                >
                  <div className="h-10 w-10 rounded-lg bg-brand-green-dark flex items-center justify-center group-hover:bg-brand-green transition-colors">
                    <action.icon className="h-5 w-5 text-white group-hover:text-black" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-text-muted">{action.description}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-brand-green transition-colors" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates on your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity) => {
                  const Icon = activityIcons[activity.type];
                  const content = (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-text-muted" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary">{activity.message}</p>
                        <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(activity.date)}
                        </p>
                      </div>
                    </div>
                  );
                  return activity.href ? (
                    <Link key={activity.id} href={activity.href} className="block hover:bg-surface-hover rounded-lg -m-2 p-2 transition-colors">
                      {content}
                    </Link>
                  ) : (
                    <div key={activity.id}>{content}</div>
                  );
                })
              ) : (
                <p className="text-sm text-text-muted text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Projects Preview — real user projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>Current project status overview</CardDescription>
            </div>
            <Link href="/dashboard/web2/projects" className="text-sm text-brand-green hover:underline inline-flex items-center">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {dashboardData?.projects && dashboardData.projects.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.projects.map((project) => {
                  const progress = getProgress(project.milestones);
                  return (
                    <Link
                      key={project.id}
                      href={`/dashboard/web2/projects/${project.id}`}
                      className="block border border-border rounded-lg p-4 hover:border-brand-green hover:bg-surface-hover transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{project.name}</h3>
                          <p className="text-sm text-text-muted capitalize">
                            {project.type.toLowerCase()} Build
                          </p>
                        </div>
                        <span className="text-xs bg-surface px-2 py-1 rounded">
                          {statusLabels[project.status] ?? project.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="h-2 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-green rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderKanban className="h-12 w-12 text-text-muted mx-auto mb-3 opacity-50" />
                <p className="text-sm text-text-muted mb-4">No projects yet</p>
                <Link href="/contact" className="text-sm text-brand-green hover:underline inline-flex items-center">
                  Start a project
                  <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageMotion>
  );
}
