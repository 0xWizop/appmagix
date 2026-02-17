"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Users2, Plus, Mail, Phone, Building2, Trash2, FolderKanban } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  stage?: string;
  projectId?: string;
  createdAt: Date;
}

interface Project {
  id: string;
  name: string;
}

const STAGES = [
  { value: "LEAD", label: "Lead" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "CUSTOMER", label: "Customer" },
] as const;

const stageColors: Record<string, "default" | "secondary" | "outline"> = {
  LEAD: "default",
  CONTACTED: "secondary",
  QUALIFIED: "outline",
  PROPOSAL: "default",
  CUSTOMER: "outline",
};

const stageLabels: Record<string, string> = {
  LEAD: "Lead",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  CUSTOMER: "Customer",
};

export function CRMPageClient({
  initialContacts,
  projects = [],
}: {
  initialContacts: (Contact & { ownerId: string; projectId?: string; updatedAt: Date })[];
  projects?: Project[];
}) {
  const [contacts, setContacts] = useState(initialContacts);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    stage: "LEAD",
    projectId: "",
  });

  const filteredContacts = useMemo(() => {
    if (stageFilter === "all") return contacts;
    return contacts.filter((c) => (c.stage ?? "LEAD") === stageFilter);
  }, [contacts, stageFilter]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          company: form.company.trim() || undefined,
          stage: form.stage,
          projectId: form.projectId || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to add");
      const contact = await res.json();
      setContacts((prev) => [
        {
          ...contact,
          createdAt: new Date(contact.createdAt),
          updatedAt: new Date(contact.updatedAt),
        },
        ...prev,
      ]);
      setForm({ name: "", email: "", phone: "", company: "", stage: "LEAD", projectId: "" });
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (contactId: string, stage: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, stage: updated.stage } : c))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getProjectName = (projectId?: string) =>
    projects.find((p) => p.id === projectId)?.name;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">Contacts</h2>
          <p className="text-sm text-text-muted">
            Manage leads and customers for your projects
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {STAGES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Contacts List */}
      {filteredContacts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => (
            <Card
              key={contact.id}
              className="hover:border-brand-green transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base truncate">{contact.name}</CardTitle>
                  <Select
                    value={contact.stage ?? "LEAD"}
                    onValueChange={(v) => handleUpdateStage(contact.id, v)}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-7 w-[110px] text-xs border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {contact.company && (
                  <div className="flex items-center gap-1.5 text-sm text-text-muted">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{contact.company}</span>
                  </div>
                )}
                {contact.projectId && (
                  <Link
                    href={`/dashboard/web2/projects/${contact.projectId}`}
                    className="flex items-center gap-1.5 text-sm text-brand-green hover:underline mt-1"
                  >
                    <FolderKanban className="h-3.5 w-3.5 shrink-0" />
                    {getProjectName(contact.projectId) ?? "Project"}
                  </Link>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-text-muted shrink-0" />
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-brand-green hover:underline truncate"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-text-muted shrink-0" />
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-text-secondary hover:text-text-primary truncate"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-text-muted">
                    Added {formatDate(contact.createdAt)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900"
                    onClick={() => setDeleteId(contact.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-brand-green-dark flex items-center justify-center mb-4">
              <Users2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {stageFilter === "all" ? "No contacts yet" : `No ${stageLabels[stageFilter] ?? stageFilter} contacts`}
            </h3>
            <p className="text-text-secondary max-w-md mb-6">
              {stageFilter === "all"
                ? "Add leads and customers to track relationships and opportunities for your projects."
                : "Try a different stage filter or add a new contact."}
            </p>
            {stageFilter === "all" ? (
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add your first contact
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setStageFilter("all")}>
                Show all contacts
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>
              Add a new lead or customer to your CRM.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="Acme Inc"
              />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => setForm((f) => ({ ...f, stage: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {projects.length > 0 && (
              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={form.projectId}
                  onValueChange={(v) => setForm((f) => ({ ...f, projectId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding…" : "Add Contact"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete contact?</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={loading}
            >
              {loading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
