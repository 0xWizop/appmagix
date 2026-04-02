import * as React from "react";
import {
  BarChart3,
  Users,
  Users2,
  TrendingUp,
  ArrowUpRight,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  FolderKanban,
  MessageSquare,
  CreditCard,
  FileText,
  FilePlus2,
  Wrench,
  ArrowLeftRight,
  CalendarDays,
  Shield,
  Settings,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";

const sidebarSections = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, active: true },
    ],
  },
  {
    label: "Projects",
    items: [
      { name: "Start Project", icon: FilePlus2, active: false },
      { name: "Projects", icon: FolderKanban, active: false },
    ],
  },
  {
    label: "Management",
    items: [
      { name: "CRM", icon: Users2, active: false },
      { name: "Team", icon: Users, active: false },
      { name: "Booking", icon: CalendarDays, active: false },
      { name: "Support", icon: MessageSquare, active: false },
      { name: "Billing", icon: CreditCard, active: false },
      { name: "Brand Vault", icon: Shield, active: false },
    ],
  },
  {
    label: "SaaS",
    items: [
      { name: "Sites & Analytics", icon: BarChart3, active: false },
      { name: "Reports", icon: FileText, active: false },
    ],
  },
  {
    label: "Tools",
    items: [
      { name: "File convert", icon: ArrowLeftRight, active: false },
      { name: "Playground", icon: Wrench, active: false },
    ],
  },
];

export function DashboardMockup() {
  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl overflow-hidden shadow-2xl relative group flex flex-col md:flex-row h-[620px]">
      {/* Sidebar Mockup */}
      <aside className="w-56 border-r border-white/5 bg-white/5 hidden md:flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-14 border-b border-white/5 flex items-center px-5">
          <span className="text-sm font-brand italic tracking-tight text-white/80">
            merchant<span className="text-brand-green">magix</span>.
          </span>
        </div>

        {/* Nav sections */}
        <div className="flex-1 overflow-hidden px-2 py-3 space-y-4">
          {sidebarSections.map((section) => (
            <div key={section.label} className="space-y-0.5">
              <div className="px-2 py-0.5 text-[9px] font-medium text-white/25 uppercase tracking-wider">
                {section.label}
              </div>
              {section.items.map((item) => (
                <div
                  key={item.name}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium ml-1.5 border-l-2 transition-colors",
                    item.active
                      ? "bg-brand-green/10 text-brand-green border-brand-green"
                      : "text-white/35 border-transparent"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Web2 / Web3 toggle */}
        <div className="px-3 py-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-0.5 flex">
            <div className="flex-1 rounded-md px-2 py-1 text-[10px] font-medium text-brand-green bg-brand-green/10 text-center">
              Web2
            </div>
            <div className="flex-1 rounded-md px-2 py-1 text-[10px] font-medium text-white/25 text-center">
              Web3
            </div>
          </div>
        </div>

        {/* User section */}
        <div className="border-t border-white/5 p-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="h-7 w-7 rounded-full bg-brand-green/20 border border-brand-green/30 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-2 w-14 bg-white/20 rounded-full mb-1.5" />
              <div className="h-1.5 w-20 bg-white/10 rounded-full" />
            </div>
            <ChevronDown className="h-3 w-3 text-white/20 shrink-0" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950/20 overflow-hidden">
        {/* Top Bar */}
        <div className="h-14 border-b border-white/5 bg-white/5 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3 text-[11px] text-white/40">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Welcome back</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification bell placeholder */}
            <div className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-white/10" />
            </div>
            <div className="h-7 w-7 rounded-full bg-brand-green/20 border border-brand-green/30" />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-hidden p-5 space-y-4">
          {/* Stats Grid — matches real dashboard: Projects / Tickets / Invoices */}
          <div className="grid grid-cols-3 gap-3">
            <GlassCard className="bg-brand-green/5 border-brand-green/20 text-white">
              <GlassCardHeader className="flex flex-row items-center justify-between pb-1.5">
                <GlassCardTitle className="text-[9px] uppercase tracking-wider text-white/40">Active Projects</GlassCardTitle>
                <FolderKanban className="h-3.5 w-3.5 text-brand-green" />
              </GlassCardHeader>
              <GlassCardContent>
                <div className="text-xl font-semibold">4</div>
                <div className="text-[9px] text-white/30 mt-0.5">2 in development</div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="text-white">
              <GlassCardHeader className="flex flex-row items-center justify-between pb-1.5">
                <GlassCardTitle className="text-[9px] uppercase tracking-wider text-white/40">Open Tickets</GlassCardTitle>
                <MessageSquare className="h-3.5 w-3.5 text-white/30" />
              </GlassCardHeader>
              <GlassCardContent>
                <div className="text-xl font-semibold">2</div>
                <div className="text-[9px] text-white/30 mt-0.5">Need attention</div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="text-white">
              <GlassCardHeader className="flex flex-row items-center justify-between pb-1.5">
                <GlassCardTitle className="text-[9px] uppercase tracking-wider text-white/40">Pending Invoice</GlassCardTitle>
                <CreditCard className="h-3.5 w-3.5 text-white/30" />
              </GlassCardHeader>
              <GlassCardContent>
                <div className="text-xl font-semibold">$750</div>
                <div className="text-[9px] text-amber-400 mt-0.5">Action required</div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Quick Actions + Recent Activity row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Quick Actions */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader className="pb-1.5 pt-3 px-3">
                <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-1">
                {[
                  { label: "View Projects", icon: FolderKanban },
                  { label: "New Support Ticket", icon: MessageSquare },
                  { label: "Billing", icon: CreditCard },
                  { label: "Reports", icon: FileText },
                ].map((action) => (
                  <div key={action.label} className="flex items-center gap-2.5 p-1.5 rounded-lg border border-white/5 text-[10px] text-white/50">
                    <div className="h-5 w-5 rounded bg-brand-green/10 flex items-center justify-center shrink-0">
                      <action.icon className="h-3 w-3 text-brand-green" />
                    </div>
                    {action.label}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader className="pb-1.5 pt-3 px-3">
                <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                {[
                  { label: "Project \"Bloom\" is in development", time: "2h ago", icon: FolderKanban, type: "project" },
                  { label: "\"Design phase\" milestone completed", time: "5h ago", icon: CheckCircle2, type: "milestone" },
                  { label: "Invoice #INV-004 is pending payment", time: "1d ago", icon: CreditCard, type: "invoice" },
                  { label: "Support ticket needs attention", time: "2d ago", icon: MessageSquare, type: "ticket" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px] border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                    <div className="h-5 w-5 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className={cn("h-2.5 w-2.5", item.type === "project" || item.type === "milestone" ? "text-brand-green" : item.type === "invoice" ? "text-amber-400" : "text-white/40")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/70 leading-tight truncate">{item.label}</div>
                      <div className="text-white/25 mt-0.5 flex items-center gap-1">
                        <Clock className="h-2 w-2" />{item.time}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Projects Preview row */}
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader className="pb-1.5 pt-3 px-3 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Your Projects</CardTitle>
              <span className="text-[9px] text-brand-green">View All →</span>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-2">
              {[
                { name: "Bloom Store", type: "Shopify Build", status: "Development", progress: 60, health: "healthy" },
                { name: "Agency Site", type: "Custom Website", status: "Review", progress: 85, health: "needs_attention" },
              ].map((proj) => (
                <div key={proj.name} className="border border-white/5 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <div className="text-[11px] font-medium text-white/80">{proj.name}</div>
                      <div className="text-[9px] text-white/30">{proj.type}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded",
                        proj.health === "healthy" ? "bg-brand-green/20 text-brand-green" : "bg-amber-500/20 text-amber-400"
                      )}>
                        {proj.health === "healthy" ? "On track" : "Needs attention"}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">{proj.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-green rounded-full" style={{ width: `${proj.progress}%` }} />
                    </div>
                    <span className="text-[9px] text-white/30 shrink-0">{proj.progress}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 bg-brand-green/20 rounded-full blur-[120px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-brand-green/10 rounded-full blur-[120px] pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity" />
    </div>
  );
}
