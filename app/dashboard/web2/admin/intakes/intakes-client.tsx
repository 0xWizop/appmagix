"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/toast-context";
import type { FirestoreIntake } from "@/lib/firestore";
import { Loader2, ExternalLink, FolderPlus, Mail, User } from "lucide-react";

interface IntakesClientProps {
  initialIntakes: FirestoreIntake[];
}

export function IntakesClient({ initialIntakes }: IntakesClientProps) {
  const toast = useToast();
  const [intakes, setIntakes] = useState(initialIntakes);
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const handleCreateProject = async (id: string) => {
    setCreatingId(id);
    try {
      const res = await fetch(`/api/intakes/${id}/create-project`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to create project");
      setIntakes((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "PROJECT_CREATED" as const, projectId: data.project?.id } : i
        )
      );
      toast.success("Project created");
      if (data.project?.id) {
        window.location.href = `/dashboard/web2/projects/${data.project.id}`;
      }
    } catch (e) {
      toast.error("Failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setCreatingId(null);
    }
  };

  const pending = intakes.filter((i) => i.status === "SUBMITTED");
  const completed = intakes.filter((i) => i.status !== "SUBMITTED");

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Pending ({pending.length})</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map((intake) => (
              <Card key={intake.id} className="border-brand-green">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{intake.contactName}</CardTitle>
                      <p className="text-sm text-text-muted">{intake.contactEmail}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize shrink-0">
                      {intake.projectType.replace("-", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {intake.businessName && (
                    <p className="text-sm">
                      <span className="text-text-muted">Business:</span> {intake.businessName}
                    </p>
                  )}
                  {intake.goals && (
                    <p className="text-sm line-clamp-2 text-text-secondary">{intake.goals}</p>
                  )}
                  {intake.budget && (
                    <p className="text-xs text-text-muted">Budget: {intake.budget}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleCreateProject(intake.id)}
                      disabled={creatingId === intake.id}
                    >
                      {creatingId === intake.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FolderPlus className="mr-1 h-4 w-4" />
                      )}
                      Create Project
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`mailto:${intake.contactEmail}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Completed</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {completed.map((intake) => (
              <Card key={intake.id} className="opacity-80">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{intake.contactName}</CardTitle>
                      <p className="text-sm text-text-muted">{intake.contactEmail}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {intake.status === "PROJECT_CREATED" ? "Project created" : "Reviewed"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {intake.projectId && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/web2/projects/${intake.projectId}`}>
                        View Project
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {intakes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-text-muted mx-auto mb-3 opacity-50" />
            <p className="text-text-secondary">No intakes yet</p>
            <p className="text-sm text-text-muted mt-1">
              Intakes will appear here when users submit the project form.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
