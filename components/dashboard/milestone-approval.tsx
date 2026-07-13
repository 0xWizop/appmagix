"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageSquarePlus, Loader2, ThumbsUp } from "lucide-react";

interface MilestoneApprovalProps {
  projectId: string;
  milestoneId: string;
  approvalStatus?: "APPROVED" | "CHANGES_REQUESTED" | null;
}

export function MilestoneApproval({ projectId, milestoneId, approvalStatus }: MilestoneApprovalProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const submit = async (status: "APPROVED" | "CHANGES_REQUESTED") => {
    setLoading(status);
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ approvalStatus: status }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === "APPROVED" ? "Approved — thank you!" : "Change request sent to our team");
      router.refresh();
    } catch {
      toast.error("Something went wrong", "Please try again");
    } finally {
      setLoading(null);
    }
  };

  if (approvalStatus === "APPROVED") {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-green">
        <ThumbsUp className="h-3.5 w-3.5" />
        Approved by you
      </div>
    );
  }

  if (approvalStatus === "CHANGES_REQUESTED") {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
        <MessageSquarePlus className="h-3.5 w-3.5" />
        Changes requested
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs border-brand-green/40 text-brand-green hover:bg-brand-green/10"
        onClick={() => submit("APPROVED")}
        disabled={loading !== null}
      >
        {loading === "APPROVED" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
        Approve
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-xs text-text-muted hover:text-amber-400"
        onClick={() => submit("CHANGES_REQUESTED")}
        disabled={loading !== null}
      >
        {loading === "CHANGES_REQUESTED" ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageSquarePlus className="h-3 w-3 mr-1" />}
        Request changes
      </Button>
    </div>
  );
}
