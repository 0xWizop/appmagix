"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  BarChart3,
  Wrench,
  Shield,
  Search,
  Zap,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/web2/projects"))}>
            <FolderKanban className="mr-2 h-4 w-4" />
            <span>Projects</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/web2/crm"))}>
            <User className="mr-2 h-4 w-4" />
            <span>CRM</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Management">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/web2/support"))}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Support Tickets</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/web2/billing"))}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing & Invoices</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/web2/brand-vault"))}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Brand Vault</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="SaaS & Tools">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/web2/analytics"))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/web2/tools"))}>
            <Wrench className="mr-2 h-4 w-4" />
            <span>Mini Tools</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/web2/playground"))}>
            <Zap className="mr-2 h-4 w-4" />
            <span>Tool Playground</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
