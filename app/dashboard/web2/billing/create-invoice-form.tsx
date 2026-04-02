"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";

const PRESET_AMOUNTS = [
  { value: "500", label: "$500" },
  { value: "799", label: "$799" },
  { value: "1000", label: "$1,000" },
  { value: "1500", label: "$1,500" },
  { value: "2000", label: "$2,000" },
  { value: "2499", label: "$2,499" },
  { value: "5000", label: "$5,000" },
  { value: "custom", label: "Custom amount" },
];

export function CreateInvoiceForm() {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    amountPreset: "",
    amountCustom: "",
    customerEmail: "",
    description: "",
    projectId: "",
    dueDate: "",
  });

  useEffect(() => {
    fetch("/api/projects", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const message =
            typeof data?.error === "string"
              ? data.error
              : "Failed to load projects";
          throw new Error(message);
        }
        return res.json();
      })
      .then((data) => setProjects(data.projects || []))
      .catch((err) => {
        console.error("Error loading projects for invoices:", err);
        setProjects([]);
        toast.error(
          "Could not load projects",
          "You can still create an invoice without linking a project."
        );
      });
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount =
      form.amountPreset === "custom"
        ? parseFloat(form.amountCustom)
        : parseFloat(form.amountPreset || "0");
    if (!form.customerEmail.trim()) {
      toast.error("Client email required", "Enter the client email to send the Stripe checkout link to.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount", "Select an amount or enter a valid custom amount in dollars.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount,
          customerEmail: form.customerEmail.trim(),
          description: form.description.trim() || undefined,
          projectId: form.projectId || undefined,
          dueDate: form.dueDate || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to create invoice");
      toast.success("Invoice created. Stripe checkout link is ready.");
      setForm({
        amountPreset: "",
        amountCustom: "",
        customerEmail: "",
        description: "",
        projectId: "",
        dueDate: "",
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error("Failed to create invoice", err instanceof Error ? err.message : "Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create invoice</DialogTitle>
          <DialogDescription>
            Set the amount and client email. A Stripe checkout link is created and the client can pay via the link.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Amount *</Label>
            <Select
              value={form.amountPreset}
              onValueChange={(v) => setForm((f) => ({ ...f, amountPreset: v }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_AMOUNTS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.amountPreset === "custom" && (
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.amountCustom}
                onChange={(e) => setForm((f) => ({ ...f, amountCustom: e.target.value }))}
                className="mt-2"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Client email (Stripe checkout is sent to this address) *</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="client@example.com"
              value={form.customerEmail}
              onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="e.g. Project deposit, Phase 1"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Project (optional)</Label>
            <Select
              value={form.projectId}
              onValueChange={(v) => setForm((f) => ({ ...f, projectId: v }))}
              disabled={projects.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {projects.length === 0 && (
              <p className="text-xs text-text-muted">
                No projects yet. You can still create invoices without linking a project.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date (optional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
