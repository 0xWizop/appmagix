"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/lib/toast-context";
import { Loader2, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
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

const canManageMembers = (role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" | null) =>
  role === "OWNER" || role === "ADMIN";

const roleLabels: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
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
  if (email && !isPlaceholderEmail(email)) return email[0].toUpperCase();
  return "?";
}

/** Hide internal placeholder emails (e.g. user-xxx@placeholder.local) from the UI */
function isPlaceholderEmail(email: string) {
  return email.endsWith("@placeholder.local");
}

function displayEmail(email?: string | null) {
  if (!email || isPlaceholderEmail(email)) return "—";
  return email;
}

function displayMemberName(m: { displayName?: string | null; email?: string | null }) {
  if (m.displayName) return m.displayName;
  if (m.email && !isPlaceholderEmail(m.email)) return m.email;
  return "Unknown";
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
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !orgName.trim()) return;
    setCreateLoading(true);
    try {
      const res = await fetch("/api/team/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: orgName.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to create organization");
      setCreateSuccessOrg({ id: data.organization.id, name: data.organization.name });
      toast.success("Organization created");
      router.refresh();
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

  const handleRoleChange = async (memberId: string, role: string) => {
    if (role === "OWNER") return;
    setUpdatingRoleId(memberId);
    try {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update");
      }
      toast.success("Role updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemovingId(memberId);
    try {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to remove");
      }
      toast.success("Member removed");
      setConfirmRemoveId(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setRemovingId(null);
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    const order = { OWNER: 0, ADMIN: 1, MEMBER: 2, VIEWER: 3 };
    return (order[a.role] ?? 4) - (order[b.role] ?? 4);
  });

  const memberToRemove = confirmRemoveId ? members.find((m) => m.id === confirmRemoveId) : null;

  return (
    <div className="p-6 lg:p-10 w-full max-w-[1400px] mx-auto space-y-10">
      <Dialog open={!!createSuccessOrg} onOpenChange={(open) => !open && setCreateSuccessOrg(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Organization created</DialogTitle>
            <DialogDescription className="text-center">
              {createSuccessOrg ? (
                <>
                  <span className="font-medium text-text-primary">{createSuccessOrg.name}</span>
                  {" "}is ready. Invite team members to get started.
                </>
              ) : (
                "Invite team members to get started."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
                router.refresh();
                setCreateSuccessOrg(null);
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmRemoveId} onOpenChange={(open) => !open && setConfirmRemoveId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove member?</DialogTitle>
            <DialogDescription>
              {memberToRemove
                ? `${displayMemberName(memberToRemove)} will lose access to the organization.`
                : "This member will lose access."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemoveId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!!removingId}
              onClick={() => confirmRemoveId && handleRemoveMember(confirmRemoveId)}
            >
              {removingId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Team</h1>
        <p className="text-text-secondary mt-2 text-base">
          Invite members and manage your organization.
        </p>
      </div>

      {!organization ? (
        <Card className="max-w-xl border-border">
          <CardHeader>
            <CardTitle>Create organization</CardTitle>
            <CardDescription>
              Create an organization to invite team members and collaborate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Name</Label>
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
                Create
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="border-border">
              <CardContent className="py-8 px-6">
                <p className="text-2xl font-semibold">{organization.name}</p>
                <p className="text-sm text-text-muted mt-1">Organization</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="py-8 px-6">
                <p className="text-2xl font-semibold">{members.length}</p>
                <p className="text-sm text-text-muted mt-1">Members</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="py-8 px-6">
                <p className="text-2xl font-semibold">{invites.length}</p>
                <p className="text-sm text-text-muted mt-1">Pending invites</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-10 lg:grid-cols-5">
            {/* Members table - main column */}
            <div className="lg:col-span-3 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Members</h2>
                <span className="text-sm text-text-muted">{members.length}</span>
              </div>
              <Card className="border-border overflow-hidden">
                <div className="overflow-x-auto">
                  {sortedMembers.length === 0 ? (
                    <div className="py-12 text-center text-text-muted text-sm">
                      No members yet
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border bg-surface">
                          <th className="px-6 py-4 font-medium text-text-primary">Name</th>
                          <th className="px-6 py-4 font-medium text-text-primary">Email</th>
                          <th className="px-6 py-4 font-medium text-text-primary">Role</th>
                          <th className="px-6 py-4 font-medium text-text-primary">Joined</th>
                          {canManageMembers(currentUserRole) && (
                            <th className="px-6 py-4 font-medium text-text-primary text-right w-24"> </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedMembers.map((m) => (
                          <tr
                            key={m.id}
                            className="border-b border-border hover:bg-surface-hover transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center text-sm font-medium text-text-secondary shrink-0">
                                  {getInitials(m.displayName, m.email)}
                                </div>
                                <span className="font-medium">
                                  {displayMemberName(m)}
                                  {m.userId === userId && (
                                    <span className="text-text-muted font-normal ml-1">(You)</span>
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-text-secondary">{displayEmail(m.email)}</td>
                            <td className="px-6 py-4">
                              {m.role === "OWNER" ? (
                                <Badge variant="default">{roleLabels.OWNER}</Badge>
                              ) : canManageMembers(currentUserRole) ? (
                                <Select
                                  value={m.role}
                                  onValueChange={(v) => handleRoleChange(m.id, v)}
                                  disabled={!!updatingRoleId}
                                >
                                  <SelectTrigger className="h-9 w-[120px] border-border">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="MEMBER">Member</SelectItem>
                                    <SelectItem value="VIEWER">Viewer</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant="secondary">{roleLabels[m.role] ?? m.role}</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-text-muted">{formatDate(m.joinedAt)}</td>
                            {canManageMembers(currentUserRole) && (
                              <td className="px-6 py-4 text-right">
                                {m.role !== "OWNER" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-text-muted hover:text-red-400"
                                    onClick={() => setConfirmRemoveId(m.id)}
                                    aria-label="Remove member"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>

              {invites.length > 0 && canInvite(currentUserRole) && (
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Pending invites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {invites.map((inv) => (
                        <li
                          key={inv.id}
                          className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                          <div>
                            <span className="text-sm font-medium">{inv.email}</span>
                            <span className="text-xs text-text-muted ml-2">{roleLabels[inv.role]}</span>
                          </div>
                          <Badge variant="secondary">Pending</Badge>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column: invite + role reference */}
            <div className="lg:col-span-2 space-y-8">
              {canInvite(currentUserRole) && (
                <Card className="border-border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Invite</CardTitle>
                    <CardDescription>
                      Send an email invite to join.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {lastInviteUrl && (
                      <div className="flex gap-2">
                        <Input readOnly value={lastInviteUrl} className="font-mono text-xs flex-1" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(lastInviteUrl);
                            toast.success("Copied");
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    )}
                    <form onSubmit={handleInvite} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="inviteEmail">Email</Label>
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
                        {inviteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send invite
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Roles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <span className="font-medium">Owner</span>
                    <p className="text-text-muted text-xs mt-0.5">Full control. Can delete organization and transfer ownership.</p>
                  </div>
                  <div>
                    <span className="font-medium">Admin</span>
                    <p className="text-text-muted text-xs mt-0.5">Can invite and remove members, manage roles.</p>
                  </div>
                  <div>
                    <span className="font-medium">Member</span>
                    <p className="text-text-muted text-xs mt-0.5">Full access to projects and tools.</p>
                  </div>
                  <div>
                    <span className="font-medium">Viewer</span>
                    <p className="text-text-muted text-xs mt-0.5">Read-only access.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
