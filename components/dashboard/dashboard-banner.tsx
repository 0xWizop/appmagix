"use client";

import { usePathname } from "next/navigation";
import { NotificationBell } from "./notification-bell";

const ROUTE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your projects and activity" },
  "/dashboard/web2/projects": { title: "Projects", subtitle: "Your project status and progress" },
  "/dashboard/web2/intake": { title: "Request Work", subtitle: "Submit a new project or change request" },
  "/dashboard/web2/support": { title: "Support", subtitle: "Support requests and correspondence" },
  "/dashboard/web2/support/new": { title: "New Ticket", subtitle: "Create a support request" },
  "/dashboard/web2/billing": { title: "Billing", subtitle: "Invoices and payment history" },
  "/dashboard/web2/analytics": { title: "Site Analytics", subtitle: "Traffic and performance for your connected sites" },
  "/dashboard/settings": { title: "Settings", subtitle: "Manage your account and preferences" },
  "/dashboard/web2/admin/clients": { title: "Clients", subtitle: "Manage client accounts" },
  "/dashboard/web2/admin/invoices": { title: "Invoices", subtitle: "Manage invoices" },
  "/dashboard/web2/admin/tickets": { title: "Tickets", subtitle: "Manage support tickets" },
  "/dashboard/web2/admin/intakes": { title: "Intakes", subtitle: "Project intake requests" },
};

function getTitleForPath(pathname: string): { title: string; subtitle?: string } {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith("/dashboard/web2/projects/")) return { title: "Project", subtitle: "Project details and milestones" };
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
