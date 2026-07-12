"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/toast-context";
import { CheckCircle2, Circle, Clock, Plus, Loader2, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

interface Task {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  user?: { name: string | null; email: string };
}

interface TaskListProps {
  projectId: string;
  initialTasks: Task[];
  isAdmin: boolean;
}

const statusIcon = {
  OPEN: <Circle className="h-4 w-4 text-text-muted" />,
  IN_PROGRESS: <Clock className="h-4 w-4 text-amber-400" />,
  RESOLVED: <CheckCircle2 className="h-4 w-4 text-brand-green" />,
};

const statusLabel = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Done",
};

const priorityColor = {
  LOW: "secondary",
  MEDIUM: "warning",
  HIGH: "error",
} as const;

export function TaskList({ projectId, initialTasks, isAdmin }: TaskListProps) {
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const openTasks = tasks.filter((t) => t.status !== "RESOLVED");
  const doneTasks = tasks.filter((t) => t.status === "RESOLVED");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subject: newTask.trim(),
          description: newTask.trim(),
          priority: "MEDIUM",
          projectId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to add task");
      setTasks((prev) => [data.ticket, ...prev]);
      setNewTask("");
      setAdding(false);
      toast.success("Task added");
    } catch (err) {
      toast.error("Failed", err instanceof Error ? err.message : "Try again");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: TicketStatus) => {
    setUpdatingId(id);
    try {
      const endpoint = isAdmin ? `/api/admin/tickets/${id}` : `/api/tickets/${id}`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (err) {
      toast.error("Failed to update task", err instanceof Error ? err.message : "Try again");
    } finally {
      setUpdatingId(null);
    }
  };

  const cycleStatus = (task: Task) => {
    if (!isAdmin && task.status !== "OPEN") return; // clients can only open tasks
    const next: Record<TicketStatus, TicketStatus> = {
      OPEN: "IN_PROGRESS",
      IN_PROGRESS: "RESOLVED",
      RESOLVED: "OPEN",
    };
    handleStatusChange(task.id, next[task.status]);
  };

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">
          Tasks
          {openTasks.length > 0 && (
            <span className="ml-2 text-sm font-normal text-text-muted">
              {openTasks.length} open
            </span>
          )}
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAdding((v) => !v)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add task
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add task form */}
        {adding && (
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              autoFocus
              placeholder="Describe the task or change..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => { setAdding(false); setNewTask(""); }}
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* Open tasks */}
        {openTasks.length === 0 && !adding && (
          <p className="text-sm text-text-muted text-center py-4">
            No open tasks. Add one to track changes or requests.
          </p>
        )}
        {openTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-brand-green/40 transition-colors"
          >
            <button
              type="button"
              onClick={() => cycleStatus(task)}
              disabled={updatingId === task.id || (!isAdmin && task.status !== "OPEN")}
              className={cn(
                "mt-0.5 shrink-0 transition-opacity",
                (!isAdmin && task.status !== "OPEN") ? "opacity-40 cursor-default" : "hover:opacity-70"
              )}
              title={isAdmin ? "Click to advance status" : undefined}
            >
              {updatingId === task.id
                ? <Loader2 className="h-4 w-4 animate-spin text-brand-green" />
                : statusIcon[task.status]}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{task.subject}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-text-muted">{statusLabel[task.status]}</span>
                <Badge variant={priorityColor[task.priority]} className="text-[10px] py-0">
                  {task.priority}
                </Badge>
                {isAdmin && task.user && (
                  <span className="text-xs text-text-muted truncate">
                    — {task.user.name ?? task.user.email}
                  </span>
                )}
              </div>
            </div>
            {/* Admin status buttons */}
            {isAdmin && (
              <div className="flex gap-1 shrink-0">
                {task.status !== "IN_PROGRESS" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                    disabled={updatingId === task.id}
                    className="text-[10px] px-2 py-1 rounded border border-amber-400/40 text-amber-400 hover:bg-amber-400/10 transition-colors"
                  >
                    In Progress
                  </button>
                )}
                {task.status !== "RESOLVED" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(task.id, "RESOLVED")}
                    disabled={updatingId === task.id}
                    className="text-[10px] px-2 py-1 rounded border border-brand-green/40 text-brand-green hover:bg-brand-green/10 transition-colors"
                  >
                    Done
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Completed tasks (collapsible) */}
        {doneTasks.length > 0 && (
          <details className="group">
            <summary className="flex items-center gap-2 text-xs text-text-muted cursor-pointer select-none py-1 list-none">
              <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
              {doneTasks.length} completed
            </summary>
            <div className="mt-2 space-y-2">
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-border opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
                  <p className="text-sm line-through text-text-muted truncate">{task.subject}</p>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(task.id, "OPEN")}
                      className="ml-auto text-[10px] px-2 py-1 rounded border border-border text-text-muted hover:border-brand-green/40 hover:text-brand-green transition-colors shrink-0"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
