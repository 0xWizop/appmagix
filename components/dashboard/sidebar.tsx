"use client";

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
  FilePlus2,
  Inbox,
  Users,
  FileText,
} from "lucide-react";

const clientNav = [
  { section: "Overview", items: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ]},
  { section: "My Project", items: [
    { name: "Request Work", href: "/dashboard/web2/intake", icon: FilePlus2 },
    { name: "Projects", href: "/dashboard/web2/projects", icon: FolderKanban },
  ]},
  { section: "Support & Billing", items: [
    { name: "Support", href: "/dashboard/web2/support", icon: MessageSquare },
    { name: "Billing", href: "/dashboard/web2/billing", icon: CreditCard },
  ]},
  { section: "Analytics", items: [
    { name: "Sites & Analytics", href: "/dashboard/web2/analytics", icon: BarChart3 },
  ]},
];

const adminNav = [
  { section: "Overview", items: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ]},
  { section: "Projects", items: [
    { name: "Intakes", href: "/dashboard/web2/admin/intakes", icon: Inbox },
    { name: "Projects", href: "/dashboard/web2/projects", icon: FolderKanban },
  ]},
  { section: "Clients", items: [
    { name: "Clients", href: "/dashboard/web2/admin/clients", icon: Users },
    { name: "Tickets", href: "/dashboard/web2/admin/tickets", icon: MessageSquare },
    { name: "Invoices", href: "/dashboard/web2/admin/invoices", icon: FileText },
  ]},
  { section: "Support & Billing", items: [
    { name: "Support", href: "/dashboard/web2/support", icon: MessageSquare },
    { name: "Billing", href: "/dashboard/web2/billing", icon: CreditCard },
  ]},
  { section: "Analytics", items: [
    { name: "Sites & Analytics", href: "/dashboard/web2/analytics", icon: BarChart3 },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useFirebaseAuth();

  const isAdmin = user?.role === "ADMIN";
  const nav = isAdmin ? adminNav : clientNav;

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex h-full min-h-screen w-full flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-brand italic tracking-tight">
            web<span className="text-brand-green">mint</span>.
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {nav.map(({ section, items }) => (
          <div key={section}>
            <div className="px-3 py-1 text-xs font-medium text-text-muted">{section}</div>
            {items.map((item) => {
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
                      : "text-text-secondary hover:bg-brand-green/10 hover:text-brand-green"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <Separator />

      {/* User Menu */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-6">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="bg-brand-green/20 text-brand-green text-sm">
                  {getInitials(user?.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium truncate">{user?.displayName || "User"}</div>
                <div className="text-xs text-text-muted truncate">
                  {user?.email && !user.email.endsWith("@placeholder.local") ? user.email : null}
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
