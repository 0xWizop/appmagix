import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/firebase-session";
import { getProjectWithDetails } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle,
  Circle,
  Loader2,
  MessageSquare,
  FileText,
} from "lucide-react";
import { ConnectSiteCard } from "@/components/dashboard/connect-site-card";

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "info"> = {
  DISCOVERY: "info",
  DESIGN: "warning",
  DEVELOPMENT: "default",
  REVIEW: "warning",
  LAUNCHED: "success",
};

const statusLabels: Record<string, string> = {
  DISCOVERY: "Discovery",
  DESIGN: "Design",
  DEVELOPMENT: "Development",
  REVIEW: "Review",
  LAUNCHED: "Launched",
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

  if (!session?.user?.id) {
    notFound();
  }

  let project: Awaited<ReturnType<typeof getProjectWithDetails>> = null;
  
  try {
    project = await getProjectWithDetails(id, session.user.id);
  } catch (error) {
    console.error("Error fetching project:", error);
  }

  if (!project) {
    notFound();
  }

  const completedMilestones = project.milestones.filter(
    (m) => m.status === "COMPLETED"
  ).length;
  const progress = project.milestones.length > 0
    ? Math.round((completedMilestones / project.milestones.length) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/dashboard/web2/projects">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </Button>

      {/* Project Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-medium">{project.name}</h1>
            <Badge variant={statusColors[project.status]}>
              {statusLabels[project.status]}
            </Badge>
          </div>
          <p className="text-text-secondary capitalize">
            {project.type.toLowerCase()} Build
          </p>
        </div>
        <div className="flex gap-2">
          {project.websiteUrl && (
            <Button variant="outline" asChild>
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Site
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

      {/* Project Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Start Date</span>
            </div>
            <p className="font-medium">
              {project.startDate ? formatDate(project.startDate) : "TBD"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Target Launch</span>
            </div>
            <p className="font-medium">
              {project.targetLaunchDate
                ? formatDate(project.targetLaunchDate)
                : "TBD"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Milestones</span>
            </div>
            <p className="font-medium">
              {completedMilestones} / {project.milestones.length} Complete
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <Loader2 className="h-4 w-4" />
              <span className="text-sm">Progress</span>
            </div>
            <p className="font-medium">{progress}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {project.description && (
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">{project.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Progress Bar */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    {completedMilestones} of {project.milestones.length} milestones
                    completed
                  </span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-3 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-green rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>
                Track the progress of each phase
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.milestones.length > 0 ? (
                <div className="space-y-4">
                  {project.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {milestoneStatusIcons[milestone.status]}
                        {index < project.milestones.length - 1 && (
                          <div className="w-px h-full bg-border mt-2 min-h-[40px]" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{milestone.title}</h4>
                          {milestone.dueDate && (
                            <span className="text-xs text-text-muted">
                              Due: {formatDate(milestone.dueDate)}
                            </span>
                          )}
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-text-secondary mt-1">
                            {milestone.description}
                          </p>
                        )}
                        {milestone.status === "COMPLETED" && milestone.completedAt && (
                          <p className="text-xs text-brand-green mt-1">
                            Completed {formatDate(milestone.completedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-center py-4">
                  Milestones will be added once the project begins
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Connect Site / Analytics */}
          <ConnectSiteCard
            projectId={project.id}
            websiteUrl={project.websiteUrl}
            siteVerifiedAt={project.siteVerifiedAt}
          />

          {/* Open Tickets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Open Tickets</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/web2/support">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {project.tickets.length > 0 ? (
                <div className="space-y-3">
                  {project.tickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      href={`/dashboard/web2/support/${ticket.id}`}
                      className="block p-3 rounded-lg border border-border hover:border-brand-green transition-colors"
                    >
                      <div className="font-medium text-sm truncate">
                        {ticket.subject}
                      </div>
                      <div className="text-xs text-text-muted mt-1 capitalize">
                        {ticket.status.toLowerCase().replace("_", " ")}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-2">
                  No open tickets
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Invoices</CardTitle>
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
                      href={`/dashboard/web2/billing`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-brand-green transition-colors"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-xs text-text-muted">
                          ${(invoice.amount / 100).toFixed(2)}
                        </div>
                      </div>
                      <Badge
                        variant={
                          invoice.status === "PAID" ? "success" : "warning"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-2">
                  No invoices yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
