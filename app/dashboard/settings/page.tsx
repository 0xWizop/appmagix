"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useFirebaseAuth, type AccountType } from "@/lib/firebase-auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Bell, Shield, Palette, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const NOTIFICATION_KEYS = [
  { key: "projectUpdates", title: "Project Updates", description: "Get notified when your project status changes" },
  { key: "supportResponses", title: "Support Responses", description: "Get notified when you receive a ticket response" },
  { key: "invoiceReminders", title: "Invoice Reminders", description: "Get reminded about upcoming or overdue invoices" },
  { key: "marketingUpdates", title: "Marketing Updates", description: "Receive tips and news about ecommerce" },
] as const;

type NotificationKey = (typeof NOTIFICATION_KEYS)[number]["key"];

export default function SettingsPage() {
  const { user } = useFirebaseAuth();
  const toast = useToast();
  const [profileLoading, setProfileLoading] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("USER");
  const [accountTypeLoading, setAccountTypeLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    projectUpdates: true,
    supportResponses: true,
    invoiceReminders: true,
    marketingUpdates: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.displayName ?? "",
        email: user.email ?? "",
      });
    }
  }, [user]);

  useEffect(() => {
    fetch("/api/user/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.accountType) setAccountType(user.accountType);
  }, [user?.accountType]);

  const handleAccountTypeChange = (type: AccountType) => {
    const prev = accountType;
    setAccountType(type);
    setAccountTypeLoading(true);
    fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountType: type }),
    })
      .then(() => toast.success("Account type updated"))
      .catch(() => {
        toast.error("Failed to update");
        setAccountType(prev);
      })
      .finally(() => setAccountTypeLoading(false));
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: formData.name.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update profile");
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Update failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleNotifToggle = (key: NotificationKey, enabled: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: enabled }));
  };

  const handleNotifSave = async () => {
    setNotifLoading(true);
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      toast.success("Notifications updated");
    } catch (error) {
      toast.error("Update failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setNotifLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.photoURL ?? undefined} />
                    <AvatarFallback className="bg-brand-green-dark text-white text-xl">
                      {getInitials(user.displayName ?? user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" type="button" disabled>
                      Change Avatar
                    </Button>
                    <p className="text-xs text-text-muted mt-1">Coming soon</p>
                  </div>
                </div>
                <Separator />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} disabled />
                    <p className="text-xs text-text-muted">Contact support to change</p>
                  </div>
                </div>
                <Button type="submit" disabled={profileLoading}>
                  {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what updates you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {NOTIFICATION_KEYS.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-text-muted">{item.description}</div>
                  </div>
                  <Button
                    variant={notifications[item.key] ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotifToggle(item.key, !notifications[item.key])}
                  >
                    {notifications[item.key] ? "On" : "Off"}
                  </Button>
                </div>
              ))}
              <Button onClick={handleNotifSave} disabled={notifLoading}>
                {notifLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <div className="font-medium">Password</div>
                  <div className="text-sm text-text-muted">Managed by Firebase Auth</div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Change Password
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-text-muted">Add an extra layer of security</div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                <div>
                  <div className="font-medium">Delete Account</div>
                  <div className="text-sm text-text-muted">Permanently delete your account and data</div>
                </div>
                <Button variant="destructive" size="sm" disabled>
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Type</CardTitle>
              <CardDescription>Switch between User and Developer views. Affects which tools appear in your sidebar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <div className="font-medium">User</div>
                  <div className="text-sm text-text-muted">
                    I need websites or apps built. Shows Projects, CRM, Support, Billing.
                  </div>
                </div>
                <div className="flex rounded-lg border border-border p-1">
                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange("USER")}
                    disabled={accountTypeLoading}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      accountType === "USER"
                        ? "bg-brand-green-dark text-white"
                        : "text-text-muted hover:text-text-primary"
                    )}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange("DEVELOPER")}
                    disabled={accountTypeLoading}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      accountType === "DEVELOPER"
                        ? "bg-brand-green-dark text-white"
                        : "text-text-muted hover:text-text-primary"
                    )}
                  >
                    Developer
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the dashboard looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-sm text-text-muted">Light, dark, or system</div>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team & Organization</CardTitle>
              <CardDescription>Invite members and manage roles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-4">
                Collaborate with your team by inviting members and assigning roles. Manage your organization settings.
              </p>
              <Button asChild>
                <Link href="/dashboard/web2/team">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Team
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
