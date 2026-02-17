"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/lib/firebase-auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  CreditCard,
  BarChart3,
  Menu,
  X,
  LogOut,
  Settings,
  Users,
  Users2,
  FileText,
  Package,
  Wrench,
  ArrowLeftRight,
  Send,
  FilePlus2,
  Inbox,
  Activity,
  Wallet,
  Vote,
  Search,
} from "lucide-react";

const clientTopNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/dashboard/web2/analytics", icon: BarChart3 },
];

const clientProjectsSection = [
  { name: "Start Project", href: "/dashboard/web2/intake", icon: FilePlus2 },
  { name: "Projects", href: "/dashboard/web2/projects", icon: FolderKanban },
];

const clientPeopleSection = [
  { name: "CRM", href: "/dashboard/web2/crm", icon: Users2 },
  { name: "Team", href: "/dashboard/web2/team", icon: Users },
];

const clientTrackSection = [
  { name: "Tools", href: "/dashboard/web2/tools", icon: Search },
  { name: "Apps", href: "/dashboard/web2/apps", icon: Package },
  { name: "File Convert", href: "/dashboard/web2/file-convert", icon: ArrowLeftRight },
  { name: "Support", href: "/dashboard/web2/support", icon: MessageSquare },
  { name: "Billing", href: "/dashboard/web2/billing", icon: CreditCard },
];

const clientNavigationDev = [
  { name: "Playground", href: "/dashboard/web2/playground", icon: Wrench },
  { name: "API Builder", href: "/dashboard/web2/api-builder", icon: Send },
];

const adminTopNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/dashboard/web2/analytics", icon: BarChart3 },
];

const adminProjectsSection = [
  { name: "Intakes", href: "/dashboard/web2/admin/intakes", icon: Inbox },
  { name: "Projects", href: "/dashboard/web2/projects", icon: FolderKanban },
];

const adminPeopleSection = [
  { name: "CRM", href: "/dashboard/web2/crm", icon: Users2 },
  { name: "Team", href: "/dashboard/web2/team", icon: Users },
];

const adminTrackSection = [
  { name: "Tools", href: "/dashboard/web2/tools", icon: Search },
  { name: "Apps", href: "/dashboard/web2/apps", icon: Package },
  { name: "File Convert", href: "/dashboard/web2/file-convert", icon: ArrowLeftRight },
  { name: "Clients", href: "/dashboard/web2/admin/clients", icon: Users },
  { name: "Tickets", href: "/dashboard/web2/admin/tickets", icon: MessageSquare },
  { name: "Invoices", href: "/dashboard/web2/admin/invoices", icon: FileText },
  { name: "Support", href: "/dashboard/web2/support", icon: MessageSquare },
  { name: "Billing", href: "/dashboard/web2/billing", icon: CreditCard },
];

const adminNavigationDev = [
  { name: "Playground", href: "/dashboard/web2/playground", icon: Wrench },
  { name: "API Builder", href: "/dashboard/web2/api-builder", icon: Send },
];

const web3Navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Protocol Dashboard", href: "/dashboard/web3/protocol", icon: Activity },
  { name: "Treasury", href: "/dashboard/web3/treasury", icon: Wallet },
  { name: "Governance", href: "/dashboard/web3/governance", icon: Vote },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [web3Mode, setWeb3Mode] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useFirebaseAuth();

  useEffect(() => {
    fetch("/api/user/preferences")
      .then((res) => res.json())
      .then((data) => {
        if (data.preferences?.web3Mode !== undefined) setWeb3Mode(data.preferences.web3Mode);
      })
      .catch(() => {})
      .finally(() => setPrefsLoading(false));
  }, []);

  const toggleWeb3Mode = (enabled: boolean) => {
    setWeb3Mode(enabled);
    fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ web3Mode: enabled }),
    }).catch(() => setWeb3Mode(!enabled));
  };

  const isAdmin = user?.role === "ADMIN";
  const topNav = isAdmin ? adminTopNav : clientTopNav;
  const projectsSection = isAdmin ? adminProjectsSection : clientProjectsSection;
  const trackSection = isAdmin ? adminTrackSection : clientTrackSection;
  const peopleSection = isAdmin ? adminPeopleSection : clientPeopleSection;
  const devNav = clientNavigationDev;

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-brand italic tracking-tight">
            merchant<span className="text-brand-green">magix</span>.
          </span>
        </Link>
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed top-14 left-0 bottom-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-200 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {web3Mode ? (
            web3Navigation.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-green/20 text-brand-green"
                      : "text-text-secondary hover:bg-brand-green/20 hover:text-brand-green"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })
          ) : (
            <>
              <div className="pb-2">
                <div className="px-3 py-1 text-xs font-medium text-text-muted">Overview</div>
                {topNav.map((item) => {
                  const isActive = item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ml-2 border-l-2 border-transparent",
                        isActive
                          ? "bg-brand-green/20 text-brand-green border-brand-green"
                          : "text-text-secondary hover:bg-brand-green/20 hover:text-brand-green"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="pt-2">
                <div className="px-3 py-1 text-xs font-medium text-text-muted">Projects</div>
                {projectsSection.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ml-2 border-l-2 border-transparent",
                        isActive
                          ? "bg-brand-green/20 text-brand-green border-brand-green"
                          : "text-text-secondary hover:bg-brand-green/20 hover:text-brand-green"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="pt-2">
                <div className="px-3 py-1 text-xs font-medium text-text-muted">Management</div>
                {peopleSection.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ml-2 border-l-2 border-transparent",
                        isActive
                          ? "bg-brand-green/20 text-brand-green border-brand-green"
                          : "text-text-secondary hover:bg-brand-green/20 hover:text-brand-green"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="pt-2">
                <div className="px-3 py-1 text-xs font-medium text-text-muted">Tools</div>
                {trackSection.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ml-2 border-l-2 border-transparent",
                        isActive
                          ? "bg-brand-green/20 text-brand-green border-brand-green"
                          : "text-text-secondary hover:bg-brand-green/20 hover:text-brand-green"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
          {!web3Mode && (
            <>
              <Separator className="my-2" />
              <div className="px-3 py-1 text-xs font-medium text-text-muted">Developer</div>
              {devNav.map((item) => {
                const isActive = item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-green/20 text-brand-green"
                        : "text-text-secondary hover:bg-brand-green/20 hover:text-brand-green"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="px-3 py-2 space-y-2">
          <div className="rounded-lg border border-border bg-surface p-1 flex">
            <button
              type="button"
              onClick={() => toggleWeb3Mode(false)}
              disabled={prefsLoading}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                !web3Mode
                  ? "bg-brand-green/20 text-brand-green"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              Web2
            </button>
            <button
              type="button"
              onClick={() => toggleWeb3Mode(true)}
              disabled={prefsLoading}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                web3Mode
                  ? "bg-brand-green/20 text-brand-green"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              Web3
            </button>
          </div>
        </div>

        <Separator />

        <div className="p-3 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback className="bg-brand-green/20 text-brand-green text-sm">
                {getInitials(user?.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium truncate">
                {user?.displayName || "User"}
              </div>
              <div className="text-xs text-text-muted truncate">
                {user?.email}
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <button
            onClick={() => signOut().then(() => router.push("/"))}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-surface-hover"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
