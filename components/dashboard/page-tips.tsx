"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPageTips, type PageTip, type WorkflowStep } from "@/lib/dashboard-help";
import { Lightbulb, ArrowRight, ChevronRight, X, PanelRightOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "merchantmagix-page-tips-dismissed";

function getDismissedPaths(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setDismissed(path: string, dismissed: boolean) {
  const next = { ...getDismissedPaths(), [path]: dismissed };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

function TipBlock({ tip, compact }: { tip: PageTip; compact?: boolean }) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-3", !compact && "space-y-2")}>
      <p className="text-sm font-medium text-text-primary">{tip.title}</p>
      <p className="text-xs text-text-secondary">{tip.body}</p>
      {tip.cta && (
        <Button variant="link" size="sm" className="h-auto p-0 text-brand-green" asChild>
          <Link href={tip.cta.href}>
            {tip.cta.label}
            <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      )}
    </div>
  );
}

function WorkflowStrip({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {steps.map((step, i) => (
        <span key={i} className="flex items-center gap-2">
          {step.href ? (
            <Link
              href={step.href}
              className="font-medium text-brand-green hover:underline inline-flex items-center gap-1"
            >
              {step.label}
              {step.description && (
                <span className="font-normal text-text-muted">— {step.description}</span>
              )}
            </Link>
          ) : (
            <span className="text-text-secondary">
              {step.label}
              {step.description && <span className="text-text-muted"> — {step.description}</span>}
            </span>
          )}
          {i < steps.length - 1 && (
            <ArrowRight className="h-4 w-4 text-text-muted shrink-0" aria-hidden />
          )}
        </span>
      ))}
    </div>
  );
}

interface PageTipsProps {
  /** Optional path to use instead of current route (e.g. for project detail page) */
  path?: string;
  /** 'card' = full card with header, 'compact' = small strip */
  variant?: "card" | "compact";
  className?: string;
}

export function PageTips({ path, variant = "card", className }: PageTipsProps) {
  const pathname = usePathname();
  const key = path ?? pathname;
  const data = getPageTips(key);

  const [dismissed, setDismissedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDismissedState(!!getDismissedPaths()[key]);
    setHydrated(true);
  }, [key]);

  const handleDismiss = () => {
    setDismissed(key, true);
    setDismissedState(true);
  };

  const handleShow = () => {
    setDismissed(key, false);
    setDismissedState(false);
  };

  if (!data || (!data.tips.length && !data.workflow?.length)) return null;
  if (!hydrated) return null;

  const { tips, workflow } = data;

  if (dismissed) {
    return (
      <div className={cn("flex items-center", className)}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleShow}
          className="text-text-muted hover:text-brand-green inline-flex items-center gap-1.5"
        >
          <PanelRightOpen className="h-4 w-4" />
          Show tips
        </Button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Lightbulb className="h-3.5 w-3.5 shrink-0" />
            {workflow && workflow.length > 0 && <WorkflowStrip steps={workflow} />}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-text-muted hover:text-text-secondary"
            onClick={handleDismiss}
            aria-label="Hide tips"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        {tips.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {tips.slice(0, 2).map((tip, i) => (
              <TipBlock key={i} tip={tip} compact />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("border-border bg-surface", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-green-dark flex items-center justify-center shrink-0">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">What you can do here</h3>
              <p className="text-xs text-text-secondary">Tips to get the most out of this page</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-text-muted hover:text-text-secondary"
            onClick={handleDismiss}
            aria-label="Hide tips"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {workflow && workflow.length > 0 && (
          <div>
            <p className="text-xs font-medium text-text-muted mb-2">Suggested workflow</p>
            <WorkflowStrip steps={workflow} />
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {tips.map((tip, i) => (
            <TipBlock key={i} tip={tip} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
