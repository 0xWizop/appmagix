"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast-context";
import { CheckCircle2, Clock, RotateCcw, Loader2 } from "lucide-react";

interface AdminTicketActionsProps {
  ticketId: string;
  currentStatus: string;
  currentPriority: string;
}

export function AdminTicketActions({ ticketId, currentStatus, currentPriority }: AdminTicketActionsProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const update = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Ticket updated");
      router.refresh();
    } catch {
      toast.error("Failed to update ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      {loading && <Loader2 className="h-4 w-4 animate-spin text-text-muted" />}
      {currentStatus !== "IN_PROGRESS" && currentStatus !== "RESOLVED" && (
        <Button size="sm" variant="outline" onClick={() => update("IN_PROGRESS")} disabled={loading}>
          <Clock className="h-4 w-4 mr-1" />
          Mark In Progress
        </Button>
      )}
      {currentStatus !== "RESOLVED" && (
        <Button size="sm" onClick={() => update("RESOLVED")} disabled={loading}>
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Resolve
        </Button>
      )}
      {currentStatus === "RESOLVED" && (
        <Button size="sm" variant="outline" onClick={() => update("OPEN")} disabled={loading}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Reopen
        </Button>
      )}
    </div>
  );
}
