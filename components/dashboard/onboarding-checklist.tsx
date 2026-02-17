"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, X, FolderKanban, Globe, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingChecklistProps {
  hasProject: boolean;
  hasConnectedSite: boolean;
  hasContact: boolean;
}

const steps = [
  {
    id: "project",
    label: "Create your first project",
    href: "/dashboard/web2/projects",
    icon: FolderKanban,
  },
  {
    id: "connect",
    label: "Connect a site to a project",
    href: "/dashboard/web2/projects",
    icon: Globe,
  },
  {
    id: "contact",
    label: "Add a contact to CRM",
    href: "/dashboard/web2/crm",
    icon: Users2,
  },
] as const;

const stepKeys = ["project", "connect", "contact"] as const;
type StepId = (typeof stepKeys)[number];
const completedMap: Record<StepId, (p: OnboardingChecklistProps) => boolean> = {
  project: (p) => p.hasProject,
  connect: (p) => p.hasConnectedSite,
  contact: (p) => p.hasContact,
};

export function OnboardingChecklist(props: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualChecks, setManualChecks] = useState<Record<StepId, boolean>>({
    project: false,
    connect: false,
    contact: false,
  });

  useEffect(() => {
    fetch("/api/user/preferences")
      .then((res) => res.json())
      .then((data) => {
        if (data.preferences?.onboardingDismissed) setDismissed(true);
        const c = data.preferences?.onboardingChecklistChecked ?? {};
        setManualChecks({
          project: c.project ?? false,
          connect: c.connect ?? false,
          contact: c.contact ?? false,
        });
      })
      .catch(() => {});
  }, []);

  const isStepDone = (stepId: StepId) =>
    completedMap[stepId](props) || manualChecks[stepId];

  const allDone = stepKeys.every((k) => isStepDone(k));
  const show = !dismissed && !allDone;

  const handleToggleCheck = async (stepId: StepId, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = { ...manualChecks, [stepId]: !manualChecks[stepId] };
    setManualChecks(next);
    try {
      await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingChecklistChecked: next }),
      });
    } catch (err) {
      console.error(err);
      setManualChecks(manualChecks);
    }
  };

  const handleDismiss = async () => {
    setLoading(true);
    try {
      await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingDismissed: true }),
      });
      setDismissed(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <Card className="bg-brand-green-dark border-brand-green">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-medium text-white">Get started</h3>
            <p className="text-sm text-white/80 mt-0.5">
              Complete these steps to get the most out of MerchantMagix
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-white/80 hover:text-white"
            onClick={handleDismiss}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {steps.map((step) => {
            const done = isStepDone(step.id);
            const Icon = step.icon;
            return (
              <li key={step.id}>
                <Link
                  href={step.href}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                    done
                      ? "text-white/60"
                      : "text-white hover:bg-brand-green hover:text-black"
                  )}
                >
                  <button
                    type="button"
                    onClick={(e) => handleToggleCheck(step.id, e)}
                    className="shrink-0 p-0.5 rounded hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label={done ? "Uncheck" : "Check"}
                  >
                    {done ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : (
                      <Circle className="h-5 w-5 text-white/60" />
                    )}
                  </button>
                  <div className="h-8 w-8 rounded-lg bg-brand-green-dark flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className={cn("text-sm flex-1", done && "line-through")}>
                    {step.label}
                  </span>
                  {!done && (
                    <span className="text-xs text-white font-medium">Go →</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
