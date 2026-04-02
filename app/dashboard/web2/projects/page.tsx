import Link from "next/link";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  FolderKanban,
  ArrowRight,
  Calendar,
  ExternalLink,
  Clock,
  Globe,
} from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageTips } from "@/components/dashboard/page-tips";
import { ProjectsHeader } from "./projects-header";

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

export default async function ProjectsPage() {
  const session = await getSession();
  let projects: { id: string; name: string; type: string; status: string; description: string | null; startDate: Date | null; targetLaunchDate: Date | null; websiteUrl: string | null; milestones: { status: string }[] }[] = [];

  try {
    if (session?.user?.id) {
      const user = await getOrCreateUserByFirebaseUid(
        session.user.id,
        session.user.email,
        session.user.name
      );
      const list = await db.project.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        include: { milestones: { orderBy: { sortOrder: "asc" } } },
      });
      projects = list.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status,
        description: p.description,
        startDate: p.startDate,
        targetLaunchDate: p.targetLaunchDate,
        websiteUrl: p.websiteUrl,
        milestones: p.milestones.map((m) => ({ status: m.status })),
      }));
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
  }

  const getProgress = (milestones: { status?: string }[]) => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter((m) => m.status === "COMPLETED").length;
    return Math.round((completed / milestones.length) * 100);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <ProjectsHeader />
      <PageTips />
      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => {
            const progress = getProgress(project.milestones);
            
            return (
              <Card key={project.id} className="hover:border-brand-green transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="capitalize">
                        {project.type.toLowerCase()} Build
                      </CardDescription>
                    </div>
                    <Badge variant={statusColors[project.status]}>
                      {statusLabels[project.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Progress Bar */}
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

                  {/* Project Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                    {project.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Started {formatDate(project.startDate)}
                      </div>
                    )}
                    {project.targetLaunchDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Target: {formatDate(project.targetLaunchDate)}
                      </div>
                    )}
                  </div>

                  {/* Live site preview */}
                  {project.websiteUrl && (
                    <div className="rounded-lg overflow-hidden border border-border bg-surface">
                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-surface">
                        <div className="flex items-center gap-1.5 text-xs text-text-muted">
                          <Globe className="h-3.5 w-3.5 text-brand-green" />
                          <span className="truncate max-w-[180px]">{project.websiteUrl.replace(/^https?:\/\//, "")}</span>
                        </div>
                        <a
                          href={project.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-green hover:underline flex items-center gap-1"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="relative h-[160px] overflow-hidden">
                        <iframe
                          src={project.websiteUrl}
                          title={`${project.name} preview`}
                          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                          style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }}
                          sandbox="allow-scripts allow-same-origin"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button asChild className="flex-1">
                      <Link href={`/dashboard/web2/projects/${project.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    {project.websiteUrl && project.status === "LAUNCHED" && (
                      <Button variant="outline" asChild>
                        <a
                          href={project.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project to track progress and milestones."
          actionLabel="Create project"
          actionHref="/dashboard/web2/projects/new"
        />
      )}
    </div>
  );
}
