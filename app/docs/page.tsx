import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  LayoutDashboard,
  Workflow,
  CreditCard,
  PlugZap,
  LifeBuoy,
  ChevronRight,
  Terminal,
  Cpu,
  Globe,
  Zap,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InteractivePreview } from "@/components/docs/interactive-preview";

export const metadata: Metadata = {
  title: "Documentation | MerchantMagix",
  description:
    "Learn how to use the MerchantMagix dashboard, tools, and workflows. Getting started, analytics, billing, integrations, and more.",
};

const sections = [
  { id: "getting-started", title: "Getting started", description: "Create your account, connect your first store, and invite your team.", href: "/docs/getting-started", badge: "GUIDE", icon: BookOpen },
  { id: "dashboard", title: "Dashboard overview", description: "Understand the main dashboard layout and key performance cards.", href: "/docs/dashboard", badge: "OVERVIEW", icon: LayoutDashboard },
  { id: "workflows", title: "Core workflows", description: "Step‑by‑step flows for weekly reviews, reporting, and CRM.", href: "/docs/workflows", badge: "PLAYBOOK", icon: Workflow },
  { id: "billing", title: "Billing & subscription", description: "Manage your MerchantMagix plan, invoices, and payment details.", href: "/docs/billing", badge: "ACCOUNT", icon: CreditCard },
  { id: "integrations", title: "Integrations", description: "Connect Shopify and other tools to bring all your data into one place.", href: "/docs/integrations", badge: "SETUP", icon: PlugZap },
  { id: "help", title: "Help & troubleshooting", description: "Fix common issues and learn when to reach out to the team.", href: "/docs/help", badge: "SUPPORT", icon: LifeBuoy },
];

export default function DocsPage() {
  return (
    <div className="flex flex-col relative z-20">
      <div className="container-width relative px-6 py-20 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-brand-green text-xs font-mono uppercase tracking-widest mb-6">
          <Terminal className="h-4 w-4" />
          <span>Documentation / Root</span>
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl mb-20">
          <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
            Technical Resource Center
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
            Everything you need to integrate, manage, and scale your merchant operations. 
            Detailed guides, API documentation, and operational playbooks.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-24">
          {sections.map((section) => (
            <a
              key={section.id}
              href={section.href}
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 hover:bg-zinc-900 transition-all hover:border-brand-green/50"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-brand-green group-hover:border-brand-green/30 transition-colors">
                  <section.icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="border-zinc-800 text-[10px] text-zinc-500 font-mono">
                  {section.badge}
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium group-hover:text-white flex items-center gap-2">
                  {section.title}
                  <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-green" />
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{section.description}</p>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-brand-green/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </a>
          ))}
        </div>

        {/* Footer Info */}
        <div className="pt-12 border-t border-zinc-900 grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-wider"><Cpu className="h-4 w-4" /><span>Performance</span></div>
            <p className="text-xs text-zinc-500">Built for speed. Examples run instantly in-browser.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-wider"><Globe className="h-4 w-4" /><span>Availability</span></div>
            <p className="text-xs text-zinc-500">Cached at the edge for sub-100ms response times globally.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-wider"><Zap className="h-4 w-4" /><span>Updates</span></div>
            <p className="text-xs text-zinc-500">Synced in real-time with our core product engine.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

