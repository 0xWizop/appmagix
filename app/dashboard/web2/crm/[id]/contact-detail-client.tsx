"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Mail, Phone, Building2, FolderKanban, Trash2, Loader2, FileText, Clock, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
import { ContactTags } from "@/components/crm/contact-tags";
import { ContactTimeline } from "@/components/crm/contact-timeline";
import { cn } from "@/lib/utils";

const STAGES = [
  { value: "LEAD", label: "Lead" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "CUSTOMER", label: "Customer" },
] as const;

type ActiveTab = "details" | "timeline";

interface ContactDetailClientProps {
  contact: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    notes?: string;
    stage: string;
    projectId?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  projects: { id: string; name: string }[];
}

export function ContactDetailClient({ contact: initialContact, projects }: ContactDetailClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [contact, setContact] = useState(initialContact);
  const [notes, setNotes] = useState(initialContact.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingStage, setSavingStage] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("details");
  const [initialTags, setInitialTags] = useState<string[]>([]);

  useEffect(() => {
    setNotes(initialContact.notes ?? "");
    setContact(initialContact);
  }, [initialContact]);

  // Fetch initial tags from Firestore
  useEffect(() => {
    fetch("/api/contacts/tags", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const map = d.tags as Record<string, string[]> | undefined;
        if (map?.[contact.id]) setInitialTags(map[contact.id]);
      })
      .catch(() => {});
  }, [contact.id]);

  const handleSaveNotes = async () => {
    if (notes === (contact.notes ?? "")) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notes: notes.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save notes");
      setContact((c) => ({ ...c, notes: data.notes ?? "", updatedAt: new Date(data.updatedAt) }));
      toast.success("Notes saved");
    } catch (err) {
      toast.error("Could not save notes", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleStageChange = async (stage: string) => {
    setSavingStage(true);
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ stage }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update stage");
      setContact((c) => ({ ...c, stage: data.stage }));
      toast.success("Stage updated");
    } catch (err) {
      toast.error("Could not update stage", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSavingStage(false);
    }
  };

  const handleProjectChange = async (projectId: string) => {
    const value = projectId === "__none__" ? undefined : projectId;
    setSavingProject(true);
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId: value ?? null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update project");
      setContact((c) => ({ ...c, projectId: data.projectId }));
      toast.success("Project updated");
    } catch (err) {
      toast.error("Could not update project", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSavingProject(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Contact deleted");
      router.push("/dashboard/web2/crm");
      router.refresh();
    } catch (err) {
      toast.error("Could not delete contact", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Button variant="ghost" asChild className="-ml-2">
        <Link href="/dashboard/web2/crm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to CRM
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{contact.name}</h1>
          <p className="text-text-secondary mt-1">
            Added {formatDate(contact.createdAt)}
            {contact.updatedAt.getTime() !== contact.createdAt.getTime() && (
              <> · Updated {formatDate(contact.updatedAt)}</>
            )}
          </p>
          {/* Tags row */}
          <div className="mt-3">
            <ContactTags contactId={contact.id} initialTags={initialTags} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={contact.stage} onValueChange={handleStageChange} disabled={savingStage}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="text-text-muted hover:text-red-400"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete contact"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-0">
        {([
          { id: "details", label: "Details", icon: FileText },
          { id: "timeline", label: "Timeline", icon: Clock },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors",
              activeTab === id
                ? "border-brand-green text-white"
                : "border-transparent text-text-muted hover:text-text-primary"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Details tab */}
      {activeTab === "details" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact details */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Contact details</CardTitle>
              <CardDescription>Email, phone, company, and linked project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-text-muted shrink-0" />
                  <a href={`mailto:${contact.email}`} className="text-brand-green hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-text-muted shrink-0" />
                  <a href={`tel:${contact.phone}`} className="text-text-secondary hover:text-text-primary">
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-text-muted shrink-0" />
                  <span className="text-text-secondary">{contact.company}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <FolderKanban className="h-4 w-4 text-text-muted shrink-0" />
                {projects.length > 0 ? (
                  <Select
                    value={contact.projectId || "__none__"}
                    onValueChange={handleProjectChange}
                    disabled={savingProject}
                  >
                    <SelectTrigger className="w-full max-w-[240px]">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-text-muted">No projects</span>
                )}
              </div>
              {!contact.email && !contact.phone && !contact.company && projects.length === 0 && (
                <p className="text-sm text-text-muted">No contact details yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
              <CardDescription>Private notes about this contact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add notes, follow-up reminders, or context…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <Button onClick={handleSaveNotes} disabled={savingNotes || notes === (contact.notes ?? "")}>
                {savingNotes && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save notes
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Timeline tab */}
      {activeTab === "timeline" && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Timeline
            </CardTitle>
            <CardDescription>Chronological history of interactions and events</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactTimeline contactId={contact.id} />
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete contact?</DialogTitle>
            <DialogDescription>
              This will permanently remove {contact.name} from your CRM. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
