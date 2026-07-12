import * as React from "react";
import {
  BarChart3,
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  CreditCard,
  FilePlus2,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarNav = [
  { section: "Overview", items: [{ name: "Dashboard", icon: LayoutDashboard, active: true }] },
  { section: "My Project", items: [
    { name: "Request Work", icon: FilePlus2, active: false },
    { name: "Projects", icon: FolderKanban, active: true },
  ]},
  { section: "Support & Billing", items: [
    { name: "Support", icon: MessageSquare, active: false },
    { name: "Billing", icon: CreditCard, active: false },
  ]},
  { section: "Analytics", items: [
    { name: "Sites & Analytics", icon: BarChart3, active: false },
  ]},
];

const quickActions = [
  { label: "Request Work", desc: "Submit a new project or change request", icon: FilePlus2 },
  { label: "View Projects", desc: "Check your project progress", icon: FolderKanban },
  { label: "Support", desc: "Open a support ticket", icon: MessageSquare },
  { label: "Analytics", desc: "View your site traffic", icon: BarChart3 },
  { label: "Billing", desc: "Invoices and payment history", icon: CreditCard },
];

export function DashboardMockup() {
  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl relative group flex h-[560px]">

      {/* ── Sidebar ── */}
      <aside className="w-44 border-r border-white/5 bg-zinc-950 hidden md:flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-12 border-b border-white/5 flex items-center px-4">
          <span className="text-sm font-brand italic tracking-tight text-white/80">
            web<span className="text-brand-green">mint</span>.
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-3 overflow-hidden">
          {sidebarNav.map((group) => (
            <div key={group.section}>
              <div className="px-2 py-0.5 text-[9px] font-medium text-white/25 uppercase tracking-wider mb-0.5">
                {group.section}
              </div>
              {group.items.map((item) => (
                <div
                  key={item.name}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium ml-1 border-l-2 transition-colors",
                    item.active && group.section === "Overview"
                      ? "bg-brand-green/10 text-brand-green border-brand-green"
                      : item.active
                      ? "bg-brand-green/10 text-brand-green border-brand-green"
                      : "text-white/35 border-transparent"
                  )}
                >
                  <item.icon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/5 p-3">
          <div className="flex items-center gap-2 px-1">
            <div className="h-6 w-6 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center shrink-0">
              <span className="text-[9px] text-brand-green font-bold">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-white/60 truncate">User</div>
            </div>
            <ChevronDown className="h-3 w-3 text-white/20 shrink-0" />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="h-12 border-b border-white/5 flex items-center justify-between px-5 shrink-0">
          <div>
            <div className="text-[11px] font-medium text-white/80">Dashboard</div>
            <div className="text-[9px] text-white/30">Overview of your projects and activity</div>
          </div>
          <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <div className="h-2.5 w-2.5 rounded-sm bg-white/20" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4 space-y-3">

          {/* Page title */}
          <div>
            <div className="text-base font-medium text-white">Dashboard</div>
            <div className="text-[10px] text-white/40">Welcome back, Web</div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Active Projects", value: "0", sub: "0 in development", icon: FolderKanban },
              { label: "Open Tickets", value: "0", sub: "Need attention", icon: MessageSquare },
              { label: "Pending Invoices", value: "$0", sub: "All paid", icon: CreditCard },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/8 bg-white/3 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-white/40 uppercase tracking-wider">{stat.label}</span>
                  <stat.icon className="h-3 w-3 text-white/20" />
                </div>
                <div className="text-xl font-semibold text-white">{stat.value}</div>
                <div className="text-[9px] text-white/30 mt-0.5">{stat.sub}</div>
                <div className="text-[9px] text-brand-green mt-1.5 flex items-center gap-0.5">
                  View details <ArrowRight className="h-2.5 w-2.5" />
                </div>
              </div>
            ))}
          </div>

          {/* Projects + Activity row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/8 bg-white/3 p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[10px] font-medium text-white/70">Your Projects</div>
                  <div className="text-[9px] text-white/30">Current project status</div>
                </div>
                <span className="text-[9px] text-brand-green">View All</span>
              </div>
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="text-[9px] text-white/25 mb-1">No projects yet</div>
                <div className="text-[9px] text-brand-green">Request a build</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/3 p-3">
              <div className="text-[10px] font-medium text-white/70 mb-2">Recent Activity</div>
              <div className="flex items-center justify-center py-4">
                <div className="text-[9px] text-white/25">No recent activity</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="text-[9px] text-white/40 uppercase tracking-wider mb-2">Quick Actions</div>
            <div className="grid grid-cols-5 gap-2">
              {quickActions.map((action) => (
                <div key={action.label} className="rounded-lg border border-white/8 bg-white/3 p-2">
                  <action.icon className="h-3 w-3 text-brand-green mb-1.5" />
                  <div className="text-[9px] font-medium text-white/70 truncate">{action.label}</div>
                  <div className="text-[8px] text-white/25 truncate mt-0.5 leading-tight">{action.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Glow */}
      <div className="absolute -top-20 -right-20 h-48 w-48 bg-brand-green/15 rounded-full blur-[80px] pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
