"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/lib/toast-context";
import {
  Loader2,
  Users,
  Mail,
  Copy,
  UserPlus,
  Shield,
  ShieldCheck,
  Eye,
  Building2,
  Clock,
} from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { Organization, OrgMember, OrgInvite } from "@/lib/firestore";

interface TeamPageClientProps {
  userId: string | null;
  organization: Organization | null;
  members: OrgMember[];
  invites: OrgInvite[];
  currentUserRole: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" | null;
}

const canInvite = (role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" | null) =>
  role === "OWNER" || role === "ADMIN";

const roleLabels: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

const roleIcons: Record<string, React.ReactNode> = {
  OWNER: <ShieldCheck className="h-3.5 w-3.5" />,
  ADMIN: <Shield className="h-3.5 w-3.5" />,
  MEMBER: <Users className="h-3.5 w-3.5" />,
  VIEWER: <Eye className="h-3.5 w-3.5" />,
};

function getInitials(name?: string | null, email?: string) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

export function TeamPageClient({
  userId,
  organization,
  members,
  invites,
  currentUserRole,
}: TeamPageClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [createLoading, setCreateLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER" | "VIEWER">("MEMBER");
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [createSuccessOrg, setCreateSuccessOrg] = useState<{ id: string; name: string } | null>(null);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !orgName.trim()) return;
    setCreateLoading(true);
    try {
      const res = await fetch("/api/team/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName.trim() }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to create organization");
      setCreateSuccessOrg({ id: data.organization.id, name: data.organization.name });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create organization");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !inviteEmail.trim()) return;
    setInviteLoading(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: organization.id,
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to invite");
      toast.success("Invite sent");
      setInviteEmail("");
      setLastInviteUrl(data.inviteUrl ?? null);
      router.refresh();
    } catch (error) {
      toast.error("Failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setInviteLoading(false);
    }
  };

  // Sort members: owner first, then admins, then members, then viewers
  const sortedMembers = [...members].sort((a, b) => {
    const order = { OWNER: 0, ADMIN: 1, MEMBER: 2, VIEWER: 3 };
    return (order[a.role] ?? 4) - (order[b.role] ?? 4);
  });

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      {/* Organization created success dialog */}
      <Dialog open={!!createSuccessOrg} onOpenChange={(open) => !open && setCreateSuccessOrg(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-brand-green-dark flex items-center justify-center">
                <Building2 className="h-7 w-7 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center">Organization created</DialogTitle>
            <DialogDescription className="text-center">
              {createSuccessOrg ? (
                <>
                  <span className="font-medium text-text-primary">{createSuccessOrg.name}</span>
                  {" "}is ready. Invite team members and start collaborating.
                </>
              ) : (
                "Invite team members and start collaborating."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-center">
            <Button
              onClick={() => {
                router.refresh();
                setCreateSuccessOrg(null);
              }}
              className="w-full sm:w-auto"
            >
              View organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-green/20 border border-brand-green/50 mb-4">
          <Users className="h-4 w-4 text-brand-green" />
          <span className="text-xs font-medium text-brand-green uppercase tracking-wider">
            Team
          </span>
        </div>
        <h1 className="text-3xl font-medium tracking-tight">Team & Organization</h1>
        <p className="text-text-secondary mt-2 text-sm max-w-xl mx-auto">
          Invite team members, manage roles, and collaborate on projects together.
        </p>
      </div>

      {!organization ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-brand-green/20 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-brand-green" />
              </div>
              <div>
                <CardTitle>Create Your Organization</CardTitle>
                <CardDescription>
                  Start collaborating. Create an organization to invite team members and manage shared projects.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="e.g. Acme Inc"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Button type="submit" disabled={createLoading || !orgName.trim()}>
                {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Organization
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Organization Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-green/20 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">{organization.name}</p>
                    <p className="text-sm text-text-muted">Organization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-green/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">{members.length}</p>
                    <p className="text-sm text-text-muted">Team members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-green/20 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">{invites.length}</p>
                    <p className="text-sm text-text-muted">Pending invites</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-7">
            {/* Members Section */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Team Members</h2>
                <span className="text-sm text-text-muted">{members.length} total</span>
              </div>
              <Card>
                <CardContent className="p-0">
                  {sortedMembers.length === 0 ? (
                    <div className="p-8 text-center text-text-muted">
                      No members yet
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {sortedMembers.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-4 p-4 hover:bg-surface-hover/50 transition-colors"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="bg-brand-green/20 text-brand-green text-sm">
                              {getInitials(m.displayName, m.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {m.displayName || m.email || "Unknown"}
                              </span>
                              {m.userId === userId && (
                                <Badge variant="outline" className="text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-text-muted truncate">
                              {m.email}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant={m.role === "OWNER" ? "default" : "secondary"}
                              className="gap-1"
                            >
                              {roleIcons[m.role]}
                              {roleLabels[m.role] ?? m.role}
                            </Badge>
                            <span className="text-xs text-text-muted hidden sm:inline">
                              {formatRelativeTime(m.joinedAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Invite & Pending Section */}
            <div className="lg:col-span-3 space-y-6">
              {canInvite(currentUserRole) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Invite Member
                    </CardTitle>
                    <CardDescription>
                      Send an invite by email. They&apos;ll receive a link to join your organization.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {lastInviteUrl && (
                      <div className="flex gap-2 p-3 rounded-lg border border-border bg-surface">
                        <Input readOnly value={lastInviteUrl} className="font-mono text-xs" />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(lastInviteUrl);
                            toast.success("Link copied");
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <form onSubmit={handleInvite} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="inviteEmail">Email address</Label>
                        <Input
                          id="inviteEmail"
                          type="email"
                          placeholder="colleague@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="VIEWER">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" disabled={inviteLoading || !inviteEmail.trim()} className="w-full">
                        {inviteLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Invite
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Pending Invites */}
              {invites.length > 0 && canInvite(currentUserRole) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Pending Invites
                    </CardTitle>
                    <CardDescription>
                      Invites awaiting response
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {invites.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border"
                        >
                          <div>
                            <div className="font-medium text-sm">{inv.email}</div>
                            <div className="text-xs text-text-muted">
                              {roleLabels[inv.role]} · {formatRelativeTime(inv.createdAt)}
                            </div>
                          </div>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Role Reference */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Role Permissions</CardTitle>
          <CardDescription>
            What each role can do
          </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Owner</span>
                        <p className="text-text-muted text-xs mt-0.5">
                          Full control. Can delete organization and transfer ownership.
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Shield className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Admin</span>
                        <p className="text-text-muted text-xs mt-0.5">
                          Can invite members and manage team settings.
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Users className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Member</span>
                        <p className="text-text-muted text-xs mt-0.5">
                          Full access to projects, tools, and content.
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Eye className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Viewer</span>
                        <p className="text-text-muted text-xs mt-0.5">
                          Read-only access to projects.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
