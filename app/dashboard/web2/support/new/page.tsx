"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewTicketPage() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "MEDIUM",
    projectId: projectId || "",
  });

  useEffect(() => {
    fetch("/api/projects", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const message =
            typeof data?.error === "string"
              ? data.error
              : "Failed to load projects";
          throw new Error(message);
        }
        return res.json();
      })
      .then((data) => setProjects(data.projects || []))
      .catch((err) => {
        console.error("Error loading projects for support:", err);
        setProjects([]);
        toast.error(
          "Could not load projects",
          "You can still create a ticket without linking a project."
        );
      });
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof data?.error === "string" ? data.error : "Failed to create ticket";
        throw new Error(message);
      }

      const ticketId = data?.ticket?.id;
      if (!ticketId) {
        throw new Error("Invalid response from server");
      }
      toast.success("Ticket created");
      router.push(`/dashboard/web2/support/${ticketId}`);
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create ticket", error instanceof Error ? error.message : "Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <Button variant="ghost" asChild className="mb-6 -ml-2">
        <Link href="/dashboard/web2/support">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Support
        </Link>
      </Button>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-medium">New ticket</CardTitle>
          <CardDescription className="text-sm">
            Submit a support request. Response within 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project">Related Project</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, projectId: value })
                  }
                  disabled={projects.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {projects.length === 0 && (
                  <p className="text-xs text-text-muted">
                    No projects yet. You can still create a ticket without linking a project.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low - General question</SelectItem>
                    <SelectItem value="MEDIUM">Medium - Issue affecting work</SelectItem>
                    <SelectItem value="HIGH">High - Urgent / Site down</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Please provide as much detail as possible about your issue or request..."
                className="min-h-[200px]"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <p className="text-xs text-text-muted">
                Include any relevant URLs, steps to reproduce, or screenshots if applicable.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Ticket
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/web2/support">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
