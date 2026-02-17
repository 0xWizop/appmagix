"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/lib/firebase-auth-context";
import { Loader2 } from "lucide-react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { DashboardBanner } from "./dashboard-banner";
import { Breadcrumbs } from "./breadcrumbs";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background relative">
      <div className="hidden lg:block shrink-0 w-64" />
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 z-30 w-64">
        <Sidebar />
      </div>
      <MobileNav />
      <main className="flex-1 min-w-0 lg:ml-0 overflow-auto relative z-10 dashboard-grid-bg">
        <div className="pt-14 lg:pt-0 min-h-full relative z-10 flex flex-col">
          <DashboardBanner />
          <div className="flex-1">
            <Breadcrumbs />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
