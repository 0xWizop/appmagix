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
import { Users2, Plus, Trash2, LayoutGrid, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
import { PageTips } from "@/components/dashboard/page-tips";

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

const dotColors: Record<string, string> = {
  LEAD: "bg-slate-400",
  CONTACTED: "bg-blue-400",
  QUALIFIED: "bg-amber-400",
  PROPOSAL: "bg-purple-400",
  CUSTOMER: "bg-brand-green",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"table" | "pipeline">("pipeline");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "stage">("recent");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    stage: "LEAD",
    projectId: "",
  });

  const filteredContacts = useMemo(() => {
    const byStage =
      stageFilter === "all"
        ? contacts
        : contacts.filter((c) => (c.stage ?? "LEAD") === stageFilter);

    const q = searchQuery.trim().toLowerCase();
    const bySearch = q
      ? byStage.filter((c) => {
      const haystack = [
        c.name,
        c.email,
        c.phone,
        c.company,
        c.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
      })
      : byStage;

    const sorted = [...bySearch];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "stage") {
      const order = ["LEAD", "CONTACTED", "QUALIFIED", "PROPOSAL", "CUSTOMER"];
      sorted.sort(
        (a, b) =>
          (order.indexOf(a.stage ?? "LEAD") ?? 0) -
          (order.indexOf(b.stage ?? "LEAD") ?? 0)
      );
    } else {
      // recent (default) - newest first
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return sorted;
  }, [contacts, stageFilter, searchQuery, sortBy]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          company: form.company.trim() || undefined,
          stage: form.stage,
          projectId: form.projectId && form.projectId !== "__none__" ? form.projectId : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : "Failed to add contact");
      const contact = data;
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
      toast.success("Contact added");
    } catch (err) {
      console.error(err);
      toast.error("Could not add contact", err instanceof Error ? err.message : "Please try again.");
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
        credentials: "include",
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
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE", credentials: "include" });
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
      <PageTips />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">Contacts</h2>
          <p className="text-sm text-text-muted">
            Manage leads and customers for your projects
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search contacts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56"
          />
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Stage" />
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
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Newest first</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
              <SelectItem value="stage">Stage</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-start mb-4">
        <Tabs value={view} onValueChange={(v) => setView(v as "table" | "pipeline")} className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="table"><List className="h-4 w-4 mr-2"/> Table</TabsTrigger>
            <TabsTrigger value="pipeline"><LayoutGrid className="h-4 w-4 mr-2"/> Pipeline</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content Area */}
      {view === "pipeline" ? (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[500px]">
          {STAGES.map((stage) => {
            const stageContacts = filteredContacts.filter(c => (c.stage ?? "LEAD") === stage.value);
            return (
              <div key={stage.value} className="bg-surface border border-border rounded-xl p-4 min-w-[320px] w-[320px] flex flex-col gap-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-text-primary flex items-center gap-2">
                    <span className={cn("w-2.5 h-2.5 rounded-full", dotColors[stage.value])} />
                    {stage.label}
                  </h3>
                  <Badge variant="secondary">{stageContacts.length}</Badge>
                </div>
                {stageContacts.map(contact => (
                   <Card key={contact.id} className="border-border hover:border-brand-green/50 transition-colors shadow-sm bg-background">
                     <CardContent className="p-4 flex flex-col gap-2">
                       <Link href={`/dashboard/web2/crm/${contact.id}`} className="font-medium text-brand-green hover:underline">{contact.name}</Link>
                       {contact.company && <p className="text-sm text-text-secondary line-clamp-1">{contact.company}</p>}
                       {contact.email && <p className="text-xs text-text-muted truncate">{contact.email}</p>}
                       <div className="pt-3 mt-2 border-t border-border flex justify-between items-center">
                         <span className="text-[10px] text-text-muted uppercase tracking-wider">{formatDate(contact.createdAt)}</span>
                         <Select value={contact.stage ?? "LEAD"} onValueChange={(v) => handleUpdateStage(contact.id, v)}>
                           <SelectTrigger className="h-7 w-auto text-xs py-0 px-2 bg-surface border-border hover:bg-surface-hover">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             {STAGES.map((s) => (
                               <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>
                     </CardContent>
                   </Card>
                ))}
                {stageContacts.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-border/50 rounded-lg text-text-muted text-sm">
                    No contacts
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : filteredContacts.length > 0 ? (
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 font-semibold text-text-primary">Name</th>
                  <th className="px-4 py-3 font-semibold text-text-primary">Company</th>
                  <th className="px-4 py-3 font-semibold text-text-primary">Email</th>
                  <th className="px-4 py-3 font-semibold text-text-primary">Phone</th>
                  <th className="px-4 py-3 font-semibold text-text-primary">Stage</th>
                  <th className="px-4 py-3 font-semibold text-text-primary">Project</th>
                  <th className="px-4 py-3 font-semibold text-text-primary">Added</th>
                  <th className="px-4 py-3 font-semibold text-text-primary text-right w-12">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-border hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      <Link
                        href={`/dashboard/web2/crm/${contact.id}`}
                        className="text-brand-green hover:underline"
                      >
                        {contact.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                      {contact.company ?? "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-brand-green hover:underline truncate max-w-[180px] inline-block"
                        >
                          {contact.email}
                        </a>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {contact.phone ? (
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-text-secondary hover:text-text-primary"
                        >
                          {contact.phone}
                        </a>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Select
                        value={contact.stage ?? "LEAD"}
                        onValueChange={(v) => handleUpdateStage(contact.id, v)}
                        disabled={loading}
                      >
                        <SelectTrigger className="h-8 w-[120px] text-xs border-border">
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
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {contact.projectId ? (
                        <Link
                          href={`/dashboard/web2/projects/${contact.projectId}`}
                          className="text-brand-green hover:underline"
                        >
                          {getProjectName(contact.projectId) ?? "Project"}
                        </Link>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-text-muted hover:text-red-400 hover:bg-surface"
                        onClick={() => setDeleteId(contact.id)}
                        disabled={loading}
                        aria-label="Delete contact"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
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
                  value={form.projectId || "__none__"}
                  onValueChange={(v) => setForm((f) => ({ ...f, projectId: v === "__none__" ? "" : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
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
