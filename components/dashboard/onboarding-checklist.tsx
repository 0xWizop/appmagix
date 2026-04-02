"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, Circle, X, FolderKanban, Globe, Users2, 
  CreditCard, BarChart3, FileText, ChevronDown 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingChecklistProps {
  hasProject: boolean;
  hasConnectedSite: boolean;
  hasContact: boolean;
  hasPendingInvoice?: boolean;
  hasSubscription?: boolean;
  hasSite?: boolean;
  compact?: boolean;
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
  {
    id: "billing",
    label: "Pay any pending invoice",
    href: "/dashboard/web2/billing",
    icon: CreditCard,
  },
  {
    id: "saas_subscribe",
    label: "Subscribe to SaaS",
    href: "/pricing",
    icon: BarChart3,
  },
  {
    id: "saas_site",
    label: "Add your first site",
    href: "/dashboard/web2/analytics",
    icon: Globe,
  },
  {
    id: "saas_report",
    label: "View your first report",
    href: "/dashboard/web2/reports",
    icon: FileText,
  },
] as const;

const stepKeys = ["project", "connect", "contact", "billing", "saas_subscribe", "saas_site", "saas_report"] as const;
type StepId = (typeof stepKeys)[number];

const completedMap: Record<StepId, (p: OnboardingChecklistProps) => boolean> = {
  project: (p) => p.hasProject,
  connect: (p) => p.hasConnectedSite,
  contact: (p) => p.hasContact,
  billing: (p) => !(p.hasPendingInvoice ?? false),
  saas_subscribe: (p) => p.hasSubscription ?? false,
  saas_site: (p) => p.hasSite ?? false,
  saas_report: (p) => (p.hasSubscription && p.hasSite) ?? false,
};

export function OnboardingChecklist(props: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [manualChecks, setManualChecks] = useState<Record<StepId, boolean>>({
    project: false, connect: false, contact: false, billing: false,
    saas_subscribe: false, saas_site: false, saas_report: false,
  });

  useEffect(() => {
    fetch("/api/user/preferences")
      .then((res) => res.json())
      .then((data) => {
        if (data.preferences?.onboardingDismissed) setDismissed(true);
        const c = data.preferences?.onboardingChecklistChecked ?? {};
        setManualChecks(c);
      })
      .catch(() => {});
  }, []);

  const isStepDone = (stepId: StepId) => completedMap[stepId](props) || manualChecks[stepId];

  const visibleSteps = steps.filter((s) => {
    if (s.id === "billing") return props.hasPendingInvoice;
    if (s.id === "saas_subscribe") return !(props.hasSubscription ?? false);
    if (s.id === "saas_site") return (props.hasSubscription ?? false) && !(props.hasSite ?? false);
    if (s.id === "saas_report") return (props.hasSubscription && props.hasSite) ?? false;
    return true;
  });

  const allDone = visibleSteps.every((s) => isStepDone(s.id));
  const show = !dismissed && !allDone;

  const completedCount = visibleSteps.filter((s) => isStepDone(s.id)).length;
  const progressPct = visibleSteps.length > 0 ? Math.round((completedCount / visibleSteps.length) * 100) : 0;

  const handleDismiss = async () => {
    setLoading(true);
    try {
      await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingDismissed: true }),
      });
      setDismissed(true);
    } catch (err) {} finally { setLoading(false); }
  };

  if (!show) return null;

  if (props.compact) {
    return (
      <Card className="bg-brand-green-dark border-brand-green overflow-hidden transition-all duration-300">
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-1.5">
                <h3 className="text-sm font-medium text-white truncate">Setup Progress</h3>
                <span className="text-xs font-bold text-white">{progressPct}%</span>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:text-white"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
            </Button>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="p-4 pt-4 space-y-2">
            <ul className="space-y-1.5">
              {visibleSteps.map((step) => {
                const done = isStepDone(step.id);
                return (
                  <li key={step.id}>
                    <Link
                      href={step.href}
                      className={cn(
                        "flex items-center gap-2 text-[10px] p-1.5 rounded transition-colors",
                        done ? "text-white/40" : "text-white hover:bg-white/10"
                      )}
                    >
                      {done ? <CheckCircle className="h-3 w-3 text-white" /> : <Circle className="h-3 w-3 text-white/40" />}
                      <span className={cn("flex-1 truncate", done && "line-through")}>
                        {step.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className="bg-brand-green-dark border-brand-green">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-medium text-white">Get started</h3>
            <p className="text-sm text-white/80 mt-0.5">Complete these steps to unlock full potential</p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 text-white/80" onClick={handleDismiss} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-white/70 mb-1.5">
            <span>{completedCount} of {visibleSteps.length} complete</span>
            <span className="font-medium">{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {visibleSteps.map((step) => {
            const done = isStepDone(step.id);
            return (
              <li key={step.id}>
                <Link href={step.href} className={cn("flex items-center gap-3 p-2 rounded-lg transition-colors", done ? "text-white/40" : "text-white hover:bg-white/10")}>
                  {done ? <CheckCircle className="h-5 w-5 text-white" /> : <Circle className="h-5 w-5 text-white/60" />}
                  <span className={cn("text-sm flex-1", done && "line-through")}>{step.label}</span>
                  {!done && <span className="text-xs font-medium">Go →</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
