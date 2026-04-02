"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, FileText, Zap, Layout, Settings, BarChart3, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const items = [
    { title: "Getting Started", href: "/docs/getting-started", icon: Zap, group: "Guides" },
    { title: "Web2 Integration", href: "/docs/web2-integration", icon: Layout, group: "Guides" },
    { title: "GlassCard", href: "/docs/components/glass-card", icon: FileText, group: "Components" },
    { title: "HeroGradient", href: "/docs/components/hero-gradient", icon: BarChart3, group: "Components" },
    { title: "User Settings", href: "/dashboard/settings", icon: Settings, group: "Settings" },
  ];

  const filtered = query 
    ? items.filter(i => i.title.toLowerCase().includes(query.toLowerCase()))
    : items;

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 w-full max-w-[240px] px-3 py-1.5 text-sm text-text-muted bg-surface border border-border rounded-lg hover:border-brand-green/30 hover:bg-surface-hover transition-all group"
      >
        <Search className="w-4 h-4 group-hover:text-brand-green" />
        <span>Search docs...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 gap-0 bg-surface border-border shadow-2xl">
          <DialogHeader className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-brand-green" />
              <Input
                placeholder="Search documentation..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none focus-visible:ring-0 text-lg px-0"
                autoFocus
              />
            </div>
          </DialogHeader>
          <div className="max-h-[350px] overflow-y-auto p-2">
            {filtered.length > 0 ? (
              <div className="space-y-1">
                {filtered.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleSelect(item.href)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-brand-green/10 group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background border border-border group-hover:border-brand-green/50 text-text-muted group-hover:text-brand-green transition-colors">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-text-primary group-hover:text-white">{item.title}</div>
                        <div className="text-[10px] text-text-muted uppercase tracking-wider">{item.group}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand-green opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-text-muted">No results found for &quot;{query}&quot;</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-border bg-background/50 flex items-center justify-between text-[10px] text-text-muted">
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><kbd className="rounded bg-surface px-1.5 py-0.5 border border-border">↑↓</kbd> to navigate</span>
              <span className="flex items-center gap-1"><kbd className="rounded bg-surface px-1.5 py-0.5 border border-border">↵</kbd> to select</span>
            </div>
            <span className="flex items-center gap-1">Search powered by <span className="text-brand-green font-brand italic">magix</span></span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
