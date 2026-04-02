import type { Metadata } from "next";
import { ChevronRight, Zap, Terminal, CheckCircle2, LayoutDashboard, Workflow, CreditCard, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";
import { InteractivePreview } from "@/components/docs/interactive-preview";
import { Badge } from "@/components/ui/badge";
import React from "react";

const sections = [
  {
    id: "getting-started",
    title: "Getting started",
    intro: "Create your account, connect your stores, and get to a live dashboard in under a day.",
    bullets: [
      "Create your MerchantMagix account and sign in for the first time.",
      "Set workspace basics like name, branding, and time zone.",
      "Connect Shopify and any other ecommerce platforms you depend on.",
      "Invite team members and assign basic roles and permissions.",
    ],
    preview: {
      sectionTitle: "Onboarding Roadmap",
      title: "Journey to Live",
      description: "A chronological process view that breaks the traditional card layout.",
      icon: <CheckCircle2 className="w-4 h-4" />,
      variant: "bespoke",
      code: "",
      component: (
        <div className="w-full py-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-brand-green/0 via-brand-green/20 to-brand-green/0 -translate-y-1/2 hidden md:block" />
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {[
              { label: "Account Setup", icon: <CheckCircle2 className="w-5 h-5" />, status: "done" },
              { label: "Data Integration", icon: <Zap className="w-5 h-5" />, status: "active" },
              { label: "Scale & Growth", icon: <LayoutDashboard className="w-5 h-5" />, status: "pending" }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-500 mb-4",
                  step.status === 'done' ? "bg-brand-green/20 border-brand-green text-brand-green shadow-[0_0_20px_rgba(34,197,94,0.2)]" :
                  step.status === 'active' ? "bg-white/5 border-white/20 text-white animate-pulse" :
                  "bg-zinc-950 border-zinc-900 text-zinc-700"
                )}>
                  {step.icon}
                </div>
                <div className="text-center">
                  <div className={cn("text-xs font-bold uppercase tracking-widest mb-1", step.status === 'active' ? "text-brand-green" : "text-zinc-500")}>Step {idx + 1}</div>
                  <div className="text-sm font-brand italic text-white/90">{step.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  },
  {
    id: "dashboard",
    title: "Dashboard overview",
    intro: "Learn what each card and chart on the main dashboard represents so you can scan performance at a glance.",
    bullets: [
      "Revenue, orders, and conversion cards at the top of the dashboard.",
      "Using date range filters to compare weeks and months.",
      "Breaking metrics down by channel, campaign, or store.",
    ],
    preview: {
      sectionTitle: "Perspective Analytics",
      title: "3D Metric Architecture",
      description: "High-performance stats with a perspective-shifted visual depth.",
      icon: <LayoutDashboard className="w-4 h-4" />,
      variant: "bespoke",
      code: "",
      component: (
        <div className="w-full flex justify-center py-20 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.05)_0%,transparent_70%)]">
          <div className="relative rotate-12 -skew-x-12 hover:rotate-0 hover:skew-x-0 transition-all duration-700 cursor-crosshair group">
            <div className="absolute -inset-8 bg-brand-green/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-10 rounded-[2.5rem] bg-zinc-950 border border-white/10 shadow-[20px_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-2 w-2 rounded-full bg-brand-green animate-ping" />
                <span className="text-[10px] font-bold text-zinc-500 tracking-[0.3em] uppercase">Enterprise Feed</span>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-brand font-bold text-white italic">$1.2M</div>
                  <div className="text-[10px] text-brand-green font-bold uppercase mt-1">+14.2% YOY</div>
                </div>
                <div className="h-px bg-white/5 w-full" />
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-xl font-brand text-zinc-300 italic">24.5k</div>
                    <div className="text-[9px] text-zinc-600 uppercase font-bold tracking-tighter">Conversions</div>
                  </div>
                  <div>
                    <div className="text-xl font-brand text-zinc-300 italic">0.8s</div>
                    <div className="text-[9px] text-zinc-600 uppercase font-bold tracking-tighter">Avg Response</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Perspective Layers */}
            <div className="absolute top-4 left-4 -right-4 -bottom-4 bg-brand-green/5 border border-brand-green/10 rounded-[2.5rem] -z-10 translate-x-4 translate-y-4 blur-[2px]" />
          </div>
        </div>
      )
    }
  },
  {
    id: "workflows",
    title: "Core workflows",
    intro: "Step‑by‑step flows for the day‑to‑day work you do inside MerchantMagix.",
    bullets: [
      "Running a weekly performance review across all your stores.",
      "Creating and exporting reports for clients or internal stakeholders.",
      "Using CRM and support views to follow up with high‑value customers.",
    ],
    preview: {
      sectionTitle: "Data Architecture",
      title: "The Logic Pipe",
      description: "Visualizing the flow of data through our automation engine.",
      icon: <Workflow className="w-4 h-4" />,
      variant: "bespoke",
      code: "",
      component: (
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-12 py-16">
          <div className="flex-1 p-6 rounded-2xl bg-zinc-950 border border-zinc-900 group">
            <div className="text-[10px] font-bold text-zinc-600 uppercase mb-4 tracking-widest">Input</div>
            <div className="h-24 flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl text-zinc-800 font-brand italic group-hover:border-zinc-500 transition-colors">
              Raw Data Stream
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center text-brand-green animate-pulse">
              <Zap className="w-6 h-6" />
            </div>
            <div className="h-px w-20 bg-brand-green/20 hidden md:block" />
          </div>
          <div className="flex-1 p-6 rounded-2xl bg-zinc-950 border border-zinc-900 group relative">
             <div className="absolute inset-0 bg-brand-green/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-[10px] font-bold text-zinc-600 uppercase mb-4 tracking-widest relative">Engine</div>
            <div className="h-24 flex items-center justify-center bg-zinc-900 rounded-xl border border-white/5 text-white font-brand italic relative">
              AI Processing...
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "billing",
    title: "Billing & subscription",
    intro: "Understand how your plan, invoices, and payment details work.",
    bullets: [
      "Checking which plan you are on and what it includes.",
      "Updating payment methods and billing details.",
      "Downloading invoices for your accounting or clients.",
    ],
    preview: {
      sectionTitle: "Subscription Tier",
      title: "Tactile Identity",
      description: "A premium glassmorphic membership card that feels like a real object.",
      icon: <CreditCard className="w-4 h-4" />,
      variant: "bespoke",
      code: "",
      component: (
        <div className="w-full flex justify-center py-20 perspective-1000">
          <div className="w-full max-w-md aspect-[1.6/1] rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/20 backdrop-blur-3xl shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="p-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="text-2xl font-brand font-medium italic italic text-white">merchant<span className="text-brand-green">magix</span>.</div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white"><CreditCard className="w-6 h-6" /></div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.4em]">Enterprise Member</div>
                <div className="text-xl font-brand italic tracking-tight text-white/90">John D. Corporate</div>
              </div>
            </div>
            {/* Card Chip Visual */}
            <div className="absolute bottom-10 right-10 w-12 h-10 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600" />
          </div>
        </div>
      )
    }
  },
  {
    id: "integrations",
    title: "Integrations",
    intro: "Connect Shopify and other tools. Copy the tracking script below into your store for analytics.",
    bullets: [
      "Connecting Shopify and verifying data flow.",
      "Managing API keys and permissions safely.",
      "Troubleshooting sync delays.",
    ],
    codeSnippet: `<script>
  (function(m,a,g,i,x){
    m['MerchantMagix']=i;
    m[i]=m[i]||function(){(m[i].q=m[i].q||[]).push(arguments)};
  })(window,document,'script','https://cdn.merchantmagix.com/tracker.js','mm');
</script>`,
    preview: {
      sectionTitle: "Live Infrastructure",
      title: "The Console",
      description: "Real-time health monitoring and implementation workspace.",
      icon: <Zap className="w-4 h-4" />,
      variant: "preview",
      code: `<IntegrationStatus platform="shopify" active={true} />`,
      component: (
         <div className="w-full bg-black rounded-3xl border border-zinc-800 p-8 shadow-2xl relative group">
            <div className="flex items-center gap-2 mb-6">
               <div className="w-3 h-3 rounded-full bg-zinc-800" />
               <div className="w-3 h-3 rounded-full bg-zinc-800" />
               <div className="w-3 h-3 rounded-full bg-zinc-800" />
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 group-hover:border-brand-green/30 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                     <span className="text-xs font-mono text-zinc-400">shopify_stream_active</span>
                  </div>
                  <Badge className="bg-brand-green/10 text-brand-green font-mono text-[9px] border-none">HEALTHY</Badge>
               </div>
               <div className="p-4 rounded-xl border border-zinc-900 text-zinc-600 italic font-brand text-xs">
                  Awaiting sync from Klaviyo...
               </div>
            </div>
         </div>
      )
    }
  },
  {
    id: "help",
    title: "Help & troubleshooting",
    intro: "Fix common issues and know when to contact the team.",
    bullets: [
      "Resolving common login issues.",
      "Checking data discrepancies.",
      "Escalating to support.",
    ],
    preview: {
      sectionTitle: "Action Terminal",
      title: "Command Center",
      description: "Strategic entry points for support and documentation.",
      icon: <LifeBuoy className="w-4 h-4" />,
      variant: "bespoke",
      code: "",
      component: (
        <div className="w-full grid md:grid-cols-2 gap-4 py-8">
           <div className="group p-8 rounded-[2rem] bg-zinc-950 border border-white/5 hover:border-brand-green/20 transition-all text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-brand-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <LifeBuoy className="w-8 h-8 text-zinc-700 mb-4 mx-auto group-hover:text-brand-green transition-transform group-hover:rotate-45" />
              <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-widest">Live Concierge</h4>
              <p className="text-[10px] text-zinc-500 font-brand italic">Average response time: 2m</p>
           </div>
           <div className="group p-8 rounded-[2rem] bg-zinc-950 border border-white/5 hover:border-brand-green/20 transition-all text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-brand-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Terminal className="w-8 h-8 text-zinc-700 mb-4 mx-auto group-hover:text-brand-green transition-transform" />
              <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-widest">Developer Hub</h4>
              <p className="text-[10px] text-zinc-500 font-brand italic">Full API Reference</p>
           </div>
        </div>
      )
    }
  },
] as const;

export function generateMetadata({ params }: { params: { section: string } }): Metadata {
  const current = sections.find((s) => s.id === params.section) ?? sections[0];
  return { title: `${current.title} | MerchantMagix Docs` };
}

export default function DocsSectionPage({ params }: { params: { section: string } }) {
  const current = sections.find((s) => s.id === params.section) ?? sections[0];

  return (
    <div className="grid h-[calc(100vh-4rem)] overflow-hidden lg:grid-cols-[280px,minmax(0,1fr),280px] w-full">
      <aside className="border-r border-zinc-800 bg-zinc-950/40 backdrop-blur-md relative z-20 h-full overflow-y-auto">
        <div className="px-6 py-12">
          <div className="mb-8">
            <div className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase mb-1">Architecture</div>
            <div className="text-lg font-brand italic tracking-tight text-white/90">
              merchant<span className="text-brand-green">magix</span>.
            </div>
          </div>
          <nav className="space-y-8 text-sm">
            <div>
              <div className="text-[10px] font-bold text-zinc-500 mb-4 uppercase tracking-[0.2em]">Documentation</div>
              <ul className="space-y-1.5">
                {sections.map((section) => {
                  const isActive = section.id === current.id;
                  return (
                    <li key={section.id}>
                      <a
                        href={`/docs/${section.id}`}
                        className={cn("flex items-center justify-between group rounded-lg px-3 py-2 text-sm transition-all text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent",
                          isActive && "bg-brand-green/5 text-brand-green font-medium border-brand-green/10"
                        )}
                      >
                        {section.title}
                        <ChevronRight className={cn("h-3 w-3", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-30")} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <div className="text-[10px] font-bold text-zinc-500 mb-4 uppercase tracking-[0.2em]">Resources</div>
              <ul className="space-y-1.5">
                <li><a href="/help" className="px-3 py-2 text-zinc-500 hover:text-zinc-200 text-sm transition-all block">Help & FAQs</a></li>
                <li><a href="/contact" className="px-3 py-2 text-zinc-500 hover:text-zinc-200 text-sm transition-all block">Contact Support</a></li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>

      <section className="h-full overflow-y-auto px-8 py-12 md:px-16 md:py-16 max-w-4xl lg:max-w-none bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.03)_0%,transparent_50%)]">
        <div className="max-w-3xl text-zinc-200">
          <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-brand-green uppercase tracking-[0.3em] font-mono">/ documentation /</span>
              <span className="text-xs font-semibold text-zinc-600 uppercase tracking-[0.3em] font-mono">{current.id}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium mb-6 bg-gradient-to-br from-white to-zinc-600 bg-clip-text text-transparent font-brand tracking-tighter">
            {current.title}
          </h1>
          <p className="text-base sm:text-xl text-zinc-400 mb-12 leading-relaxed font-brand font-light italic opacity-90">{current.intro}</p>
          
          <div className="grid gap-4 mb-20 relative">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-brand-green/50 to-transparent" />
            {current.bullets.map((item, i) => (
              <div key={i} className="group relative pl-8 py-4 transition-all">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-green shadow-[0_0_8px_rgba(34,197,94,0.5)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-zinc-100 font-medium tracking-tight">{item}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-40">
            <div className="flex items-end justify-between mb-12 gap-6 pb-6 border-b border-zinc-900">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="h-10 w-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-brand-green shadow-xl">
                        {(current.preview as any).icon}
                     </div>
                     <h2 className="text-2xl font-medium italic font-brand tracking-tighter">{current.preview.sectionTitle}</h2>
                  </div>
                  <p className="text-xs text-zinc-500 font-brand italic ml-14">{current.preview.description}</p>
               </div>
               <Badge className="bg-brand-green/5 text-brand-green text-[9px] uppercase tracking-[0.2em] border-brand-green/10 mb-2">Live Preview</Badge>
            </div>
            
            <div className="relative">
              {/* Dynamic Background Elements for individual sections */}
              {current.id === 'getting-started' && <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-green/5 blur-3xl rounded-full" />}
              {current.id === 'dashboard' && <div className="absolute top-0 right-0 w-80 h-80 bg-brand-green/3 blur-[120px] rounded-full" />}

              {(current.preview as any).variant === 'bespoke' ? (
                <div className="w-full relative min-h-[300px] flex items-center">
                  {current.preview.component}
                </div>
              ) : (
                <InteractivePreview 
                  title={current.preview.title}
                  description={current.preview.description}
                  defaultCode={(current.preview as any).code || ""}
                  showCode={current.id === 'integrations'}
                  component={current.preview.component}
                />
              )}
            </div>

            {(current.id === 'integrations' && 'codeSnippet' in current) && (
              <div className="mt-32 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-medium italic font-brand tracking-tighter">Technical Implementation</h2>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-green/20 to-zinc-900/10 blur opacity-20 group-hover:opacity-50 transition-opacity" />
                  <pre className="p-8 rounded-3xl bg-black border border-zinc-800 text-sm font-mono text-brand-green overflow-x-auto shadow-2xl relative">
                    <code className="opacity-80 group-hover:opacity-100 transition-opacity leading-relaxed font-light font-brand">{(current as any).codeSnippet}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="hidden lg:block border-l border-zinc-800 h-full overflow-y-auto">
        <div className="px-8 py-12 space-y-6">
          <div className="text-[10px] font-bold text-brand-green uppercase tracking-[0.2em]">On this page</div>
          <nav>
            <ul className="space-y-4">
              <li><a href="#top" className="block text-zinc-200 hover:text-brand-green text-sm font-medium transition-colors">Overview</a></li>
              {current.bullets.map((item, i) => (
                <li key={i}>
                  <div className="block text-zinc-500 text-[10px] leading-relaxed transition-colors pl-4 border-l border-zinc-800 uppercase tracking-tighter">
                    {item.length > 40 ? item.slice(0, 37) + "..." : item}
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  );
}
