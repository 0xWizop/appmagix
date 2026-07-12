"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, RotateCcw, Loader2 } from "lucide-react";
import Link from "next/link";

interface TicketRowActionsProps {
  ticketId: string;
  status: string;
}

export function TicketRowActions({ ticketId, status }: TicketRowActionsProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const update = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Failed to update ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      {loading && <Loader2 className="h-3 w-3 animate-spin text-text-muted" />}
      {status === "OPEN" && (
        <button
          type="button"
          onClick={() => update("IN_PROGRESS")}
          disabled={loading}
          title="Mark In Progress"
          className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-amber-400 transition-colors disabled:opacity-40"
        >
          <Clock className="h-4 w-4" />
        </button>
      )}
      {status !== "RESOLVED" && (
        <button
          type="button"
          onClick={() => update("RESOLVED")}
          disabled={loading}
          title="Mark Resolved"
          className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-brand-green transition-colors disabled:opacity-40"
        >
          <CheckCircle2 className="h-4 w-4" />
        </button>
      )}
      {status === "RESOLVED" && (
        <button
          type="button"
          onClick={() => update("OPEN")}
          disabled={loading}
          title="Reopen"
          className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/dashboard/web2/admin/tickets/${ticketId}`}>View</Link>
      </Button>
    </div>
  );
}
