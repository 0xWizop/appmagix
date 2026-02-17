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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
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

const clientTrackSection = [
  { name: "Tools", href: "/dashboard/web2/tools", icon: Search },
  { name: "Apps", href: "/dashboard/web2/apps", icon: Package },
  { name: "File Convert", href: "/dashboard/web2/file-convert", icon: ArrowLeftRight },
  { name: "Support", href: "/dashboard/web2/support", icon: MessageSquare },
  { name: "Billing", href: "/dashboard/web2/billing", icon: CreditCard },
];

const clientPeopleSection = [
  { name: "CRM", href: "/dashboard/web2/crm", icon: Users2 },
  { name: "Team", href: "/dashboard/web2/team", icon: Users },
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

const adminPeopleSection = [
  { name: "CRM", href: "/dashboard/web2/crm", icon: Users2 },
  { name: "Team", href: "/dashboard/web2/team", icon: Users },
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

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useFirebaseAuth();
  const [web3Mode, setWeb3Mode] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/preferences")
      .then((res) => res.json())
      .then((data) => {
        if (data.preferences?.web3Mode !== undefined) setWeb3Mode(data.preferences.web3Mode);
      })
      .catch(() => {})
      .finally(() => setPrefsLoading(false));
  }, []);

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
    <div className="flex h-full min-h-screen w-full flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-brand italic tracking-tight">
            merchant<span className="text-brand-green">magix</span>.
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {web3Mode ? (
          web3Navigation.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
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
            onClick={() => {
              setWeb3Mode(false);
              fetch("/api/user/preferences", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ web3Mode: false }),
              }).catch(() => {});
            }}
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
            onClick={() => {
              setWeb3Mode(true);
              fetch("/api/user/preferences", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ web3Mode: true }),
              }).catch(() => setWeb3Mode(false));
            }}
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

      {/* User Menu */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-6"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="bg-brand-green/20 text-brand-green text-sm">
                  {getInitials(user?.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium truncate">
                  {user?.displayName || "User"}
                </div>
                <div className="text-xs text-text-muted truncate">
                  {user?.email}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-text-muted" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut().then(() => router.push("/"))}
              className="text-red-400 focus:text-red-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
