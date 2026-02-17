"use client";

import { usePathname } from "next/navigation";
import { NotificationBell } from "./notification-bell";

const ROUTE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your account, projects, and tools" },
  "/dashboard/web2/projects": { title: "Projects", subtitle: "Your project status and progress" },
  "/dashboard/web2/apps": { title: "Apps", subtitle: "Manage and access our Shopify mini apps" },
  "/dashboard/web2/file-convert": { title: "File Convert", subtitle: "JSON · YAML · CSV · Image · Video — client-side conversion" },
  "/dashboard/web2/team": { title: "Team", subtitle: "Invite members and manage your organization" },
  "/dashboard/web2/support": { title: "Support", subtitle: "Support requests and correspondence" },
  "/dashboard/web2/support/new": { title: "New Ticket", subtitle: "Create a support request" },
  "/dashboard/web2/billing": { title: "Billing", subtitle: "Invoices and payment history" },
  "/dashboard/web2/crm": { title: "CRM", subtitle: "Contacts, leads, and customers" },
  "/dashboard/web2/analytics": { title: "Site Analytics", subtitle: "Traffic and performance for your connected sites" },
  "/dashboard/web2/playground": { title: "Playground", subtitle: "Developer utilities — encoding, conversion, webhooks" },
  "/dashboard/web2/tools": { title: "Tools", subtitle: "Domain, wallet, protocol lookups" },
  "/dashboard/web2/intake": { title: "Start Project", subtitle: "Submit intake for a new build" },
  "/dashboard/settings": { title: "Settings", subtitle: "Manage your account, preferences, and team" },
  "/dashboard/web2/api-builder": { title: "API Builder", subtitle: "Build and test API requests" },
  "/dashboard/web2/admin/clients": { title: "Clients", subtitle: "Manage client accounts" },
  "/dashboard/web2/admin/invoices": { title: "Invoices", subtitle: "Manage invoices" },
  "/dashboard/web2/admin/tickets": { title: "Tickets", subtitle: "Manage support tickets" },
  "/dashboard/web2/admin/intakes": { title: "Intakes", subtitle: "Project intake requests" },
};

function getTitleForPath(pathname: string): { title: string; subtitle?: string } {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith("/dashboard/web2/projects/")) return { title: "Project", subtitle: "Project details" };
  if (pathname.startsWith("/dashboard/web2/support/")) return { title: "Support Ticket", subtitle: "View and reply" };
  if (pathname.startsWith("/dashboard/web2/admin/")) return { title: "Admin", subtitle: "" };
  return { title: "Dashboard", subtitle: "" };
}

export function DashboardBanner() {
  const pathname = usePathname();
  const { title, subtitle } = getTitleForPath(pathname);

  return (
    <div className="sticky top-14 lg:top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4 lg:px-8 overflow-hidden">
      <div className="min-w-0 flex-1 overflow-hidden">
        <h1 className="text-base font-medium tracking-tight truncate leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-text-secondary truncate leading-tight mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="shrink-0 flex items-center">
        <NotificationBell />
      </div>
    </div>
  );
}
