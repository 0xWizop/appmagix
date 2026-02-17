"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, MessageSquare, FileText, FolderKanban, Check } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, React.ElementType> = {
  ticket_reply: MessageSquare,
  project_update: FolderKanban,
  invoice_reminder: FileText,
  general: Bell,
};

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function NotificationBell() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [pathname]);

  const markAsRead = async (ids: string[]) => {
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - ids.length));
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-green text-[10px] font-medium text-black">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-medium text-sm">Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              disabled={loading}
              className="text-xs text-brand-green hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-muted">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = typeIcons[n.type] ?? Bell;
              const content = (
                <div className="flex gap-3 px-4 py-3 hover:bg-surface-hover transition-colors">
                  <div
                    className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${
                      n.read ? "bg-surface" : "bg-brand-green-dark"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${n.read ? "text-text-muted" : "text-white"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.read ? "text-text-secondary" : "font-medium text-text-primary"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-text-muted line-clamp-1 mt-0.5">{n.message}</p>
                    <p className="text-xs text-text-muted mt-1">{formatRelative(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        markAsRead([n.id]);
                      }}
                      className="shrink-0 p-1 rounded hover:bg-surface"
                      aria-label="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5 text-brand-green" />
                    </button>
                  )}
                </div>
              );
              return n.href ? (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => {
                    if (!n.read) markAsRead([n.id]);
                    setOpen(false);
                  }}
                  className="block border-b border-border last:border-0"
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={n.id}
                  className="block border-b border-border last:border-0"
                >
                  {content}
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
