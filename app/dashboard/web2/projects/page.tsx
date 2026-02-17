import Link from "next/link";
import { getSession } from "@/lib/firebase-session";
import { getProjectsWithMilestones } from "@/lib/firestore";
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
} from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";

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
  
  let projects: Awaited<ReturnType<typeof getProjectsWithMilestones>> = [];
  
  try {
    if (session?.user?.id) {
      projects = await getProjectsWithMilestones(session.user.id);
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
          description="Your projects will appear here once we start working together. Ready to build something amazing?"
          actionLabel="Start a Project"
          actionHref="/contact"
        />
      )}
    </div>
  );
}
