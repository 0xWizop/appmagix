"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  web2: "Web2",
  web3: "Web3",
  projects: "Projects",
  project: "Project",
  apps: "Apps",
  "file-convert": "File Convert",
  crm: "CRM",
  team: "Team",
  support: "Support",
  billing: "Billing",
  analytics: "Analytics",
  tools: "Tools",
  playground: "Playground",
  "api-builder": "API Builder",
  settings: "Settings",
  new: "New",
  admin: "Admin",
  intake: "Start Project",
  intakes: "Intakes",
  clients: "Clients",
  tickets: "Tickets",
  invoices: "Invoices",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  if (!pathname.startsWith("/dashboard")) return null;

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .slice(1); // skip "dashboard" to get sub-path segments

  if (segments.length <= 1) return null;

  const crumbs: { label: string; href: string }[] = [];
  let href = "/dashboard";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    href += `/${seg}`;
    let label = SEGMENT_LABELS[seg];
    if (!label) {
      const prev = segments[i - 1];
      if (prev === "projects" && /^[a-zA-Z0-9-_]+$/.test(seg)) label = "Project";
      else if (prev === "support" && /^[a-zA-Z0-9-_]+$/.test(seg)) label = "Ticket";
      else label = seg;
    }
    crumbs.push({ label, href });
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-text-muted mb-2 px-6 lg:px-8 pt-4" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-text-muted/60" />}
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-text-primary truncate">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className={cn(
                "hover:text-text-primary truncate transition-colors",
                i === 0 && "text-text-secondary"
              )}
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
