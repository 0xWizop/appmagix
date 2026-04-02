import type { ReactNode } from "react";
import { DocsSearch } from "@/components/docs/docs-search";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      <header className="relative z-20 border-b border-zinc-800 bg-zinc-950">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="text-sm font-brand italic tracking-tight text-text-primary">
            merchant<span className="text-brand-green">magix</span>.
          </div>
          <div className="flex items-center gap-4">
            <DocsSearch />
          </div>
        </div>
      </header>
      <main className="relative z-10 min-h-[calc(100vh-4rem)]">{children}</main>
    </div>
  );
}
