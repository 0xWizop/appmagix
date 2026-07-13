import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { getProjectWithDetailsByPrismaUserId, getProjectWithDetailsAdmin } from "@/lib/db-projects";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft, BarChart3, Calendar, Clock, ExternalLink,
  CheckCircle, Circle, Loader2, MessageSquare,
} from "lucide-react";
import { ConnectSiteCard } from "@/components/dashboard/connect-site-card";
import { PageTips } from "@/components/dashboard/page-tips";
import { TaskList } from "@/components/dashboard/task-list";
import { PhaseTracker } from "@/components/dashboard/phase-tracker";
import { MilestoneApproval } from "@/components/dashboard/milestone-approval";

const ADMIN_EMAIL = "merchantmagix@gmail.com";

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "info"> = {
  DISCOVERY: "info", DESIGN: "warning", DEVELOPMENT: "default", REVIEW: "warning", LAUNCHED: "success",
};
const statusLabels: Record<string, string> = {
  DISCOVERY: "Discovery", DESIGN: "Design", DEVELOPMENT: "Development", REVIEW: "Review", LAUNCHED: "Launched",
};
const milestoneStatusIcons: Record<string, React.ReactNode> = {
  PENDING: <Circle className="h-5 w-5 text-text-muted" />,
  IN_PROGRESS: <Loader2 className="h-5 w-5 text-brand-green animate-spin" />,
  COMPLETED: <CheckCircle className="h-5 w-5 text-brand-green" />,
};

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user?.id) notFound();

  const user = await getOrCreateUserByFirebaseUid(session.user.id, session.user.email, session.user.name);
  const isAdmin = user.role === "ADMIN" || session.user.email === ADMIN_EMAIL;

  let project: Awaited<ReturnType<typeof getProjectWithDetailsByPrismaUserId>> = null;
  try {
    project = isAdmin
      ? await getProjectWithDetailsAdmin(id)
      : await getProjectWithDetailsByPrismaUserId(id, user.id);
  } catch (error) {
    console.error("Error fetching project:", error);
  }

  if (!project) notFound();

  const completedMilestones = project.milestones.filter((m) => m.status === "COMPLETED").length;
  const progress = project.milestones.length > 0
    ? Math.round((completedMilestones / project.milestones.length) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageTips variant="compact" />

      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="-ml-2">
          <Link href="/dashboard/web2/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
        {isAdmin && (project as any).owner && (
          <span className="text-xs text-text-muted border border-border px-2 py-1 rounded">
            Client: {(project as any).owner.name ?? (project as any).owner.email}
          </span>
        )}
      </div>

      {/* Project Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">{project.name}</h1>
            <Badge variant={statusColors[project.status]}>{statusLabels[project.status]}</Badge>
          </div>
          <p className="text-text-secondary capitalize text-lg">{project.type.toLowerCase()} Build</p>
        </div>
        <div className="flex gap-3">
          {project.websiteUrl && (
            <Button variant="outline" asChild>
              <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />View Site
              </a>
            </Button>
          )}
          <Button asChild>
            <Link href={`/dashboard/web2/support/new?project=${project.id}`}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Request Change
            </Link>
          </Button>
        </div>
      </div>

      {/* Phase tracker */}
      <Card>
        <CardContent className="pt-6">
          <PhaseTracker status={project.status} />
        </CardContent>
      </Card>

      {/* Launched CTA */}
      {project.status === "LAUNCHED" && (
        <Card className="border-brand-green bg-surface">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-brand-green/20 flex items-center justify-center shrink-0">
                  <BarChart3 className="h-5 w-5 text-brand-green" />
                </div>
                <div>
                  <div className="font-semibold text-base">Your site is live</div>
                  <p className="text-sm text-text-secondary mt-1">
                    Add it to Sites & Analytics to track traffic and get weekly summaries.
                  </p>
                </div>
              </div>
              <Button asChild className="shrink-0">
                <Link href="/dashboard/web2/analytics">Add to Analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-2 text-text-muted mb-2"><Calendar className="h-4 w-4" /><span className="text-sm font-medium">Start Date</span></div>
          <p className="text-lg font-semibold">{project.startDate ? formatDate(project.startDate) : "TBD"}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-2 text-text-muted mb-2"><Clock className="h-4 w-4" /><span className="text-sm font-medium">Target Launch</span></div>
          <p className="text-lg font-semibold">{project.targetLaunchDate ? formatDate(project.targetLaunchDate) : "TBD"}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-2 text-text-muted mb-2"><CheckCircle className="h-4 w-4" /><span className="text-sm font-medium">Milestones</span></div>
          <p className="text-lg font-semibold">{completedMilestones} / {project.milestones.length} Complete</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-2 text-text-muted mb-2"><Loader2 className="h-4 w-4" /><span className="text-sm font-medium">Progress</span></div>
          <p className="text-lg font-semibold">{progress}%</p>
        </CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main — milestones + tasks */}
        <div className="lg:col-span-2 space-y-6">
          {project.description && (
            <Card>
              <CardHeader><CardTitle>Project Description</CardTitle></CardHeader>
              <CardContent><p className="text-text-secondary leading-relaxed">{project.description}</p></CardContent>
            </Card>
          )}

          {/* Progress */}
          <Card>
            <CardHeader><CardTitle>Overall Progress</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">{completedMilestones} of {project.milestones.length} milestones completed</span>
                  <span className="text-lg font-semibold">{progress}%</span>
                </div>
                <div className="h-4 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-brand-green rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Track the progress of each phase</CardDescription>
            </CardHeader>
            <CardContent>
              {project.milestones.length > 0 ? (
                <div className="space-y-6">
                  {project.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex gap-4">
                      <div className="flex flex-col items-center pt-1">
                        {milestoneStatusIcons[milestone.status]}
                        {index < project.milestones.length - 1 && (
                          <div className="w-px h-full bg-border mt-2 min-h-[50px]" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-semibold text-base">{milestone.title}</h4>
                          {milestone.dueDate && (
                            <span className="text-xs text-text-muted whitespace-nowrap">Due: {formatDate(milestone.dueDate)}</span>
                          )}
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-text-secondary mt-2 leading-relaxed">{milestone.description}</p>
                        )}
                        {milestone.status === "COMPLETED" && milestone.completedAt && (
                          <p className="text-xs text-brand-green mt-2 font-medium">Completed {formatDate(milestone.completedAt)}</p>
                        )}
                        {/* Approval buttons — clients only, on completed milestones */}
                        {milestone.status === "COMPLETED" && !isAdmin && (
                          <MilestoneApproval
                            projectId={project.id}
                            milestoneId={milestone.id}
                            approvalStatus={(milestone as any).approvalStatus}
                          />
                        )}
                        {/* Admin sees approval state */}
                        {isAdmin && (milestone as any).approvalStatus && (
                          <p className={`text-xs mt-2 font-medium ${(milestone as any).approvalStatus === "APPROVED" ? "text-brand-green" : "text-amber-400"}`}>
                            {(milestone as any).approvalStatus === "APPROVED" ? "✓ Client approved" : "⟳ Client requested changes"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-text-muted py-8">Milestones will be added once the project begins</p>
              )}
            </CardContent>
          </Card>

          {/* Task List */}
          <TaskList
            projectId={project.id}
            initialTasks={project.tickets}
            isAdmin={isAdmin}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ConnectSiteCard
            projectId={project.id}
            websiteUrl={project.websiteUrl ?? undefined}
            siteVerifiedAt={project.siteVerifiedAt ?? undefined}
          />

          {/* Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Invoices</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/web2/billing">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {project.invoices.length > 0 ? (
                <div className="space-y-3">
                  {project.invoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href="/dashboard/web2/billing"
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-brand-green transition-colors"
                    >
                      <div>
                        <div className="font-medium text-sm">{invoice.invoiceNumber}</div>
                        <div className="text-xs text-text-muted">${(invoice.amount / 100).toFixed(2)}</div>
                      </div>
                      <Badge variant={invoice.status === "PAID" ? "success" : "warning"}>
                        {invoice.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-6">No invoices yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
