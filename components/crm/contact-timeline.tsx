"use client";

import { useState, useEffect } from "react";
import { User, FolderKanban, CreditCard, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  type: string;
  label: string;
  detail?: string;
  date: string;
  icon: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  folder: FolderKanban,
  invoice: CreditCard,
  ticket: AlertCircle,
  payment: CheckCircle,
};

const colorMap: Record<string, string> = {
  user: "bg-brand-green/20 text-brand-green",
  folder: "bg-blue-500/20 text-blue-400",
  invoice: "bg-orange-500/20 text-orange-400",
  ticket: "bg-red-500/20 text-red-400",
  payment: "bg-brand-green/20 text-brand-green",
};

interface ContactTimelineProps {
  contactId: string;
}

export function ContactTimeline({ contactId }: ContactTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contactId) return;
    setLoading(true);
    fetch(`/api/contacts/${contactId}/timeline`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setEvents(Array.isArray(d.events) ? d.events : []);
      })
      .catch(() => setError("Could not load timeline"))
      .finally(() => setLoading(false));
  }, [contactId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-text-muted gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading timeline…
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-400 py-4">{error}</p>;
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-8">
        No activity yet for this contact.
      </p>
    );
  }

  return (
    <ol className="relative border-l border-border ml-4 space-y-6 py-2">
      {events.map((evt, i) => {
        const Icon = iconMap[evt.icon] ?? User;
        const colorClass = colorMap[evt.icon] ?? "bg-surface text-text-muted";
        return (
          <li key={i} className="ml-6">
            <span className={cn(
              "absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full",
              colorClass
            )}>
              <Icon className="h-3 w-3" />
            </span>
            <div>
              <p className="text-sm font-medium leading-none">{evt.label}</p>
              {evt.detail && (
                <p className="text-xs text-text-muted mt-0.5">{evt.detail}</p>
              )}
              <time className="text-xs text-text-muted mt-1 block">
                {formatDate(new Date(evt.date))}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
