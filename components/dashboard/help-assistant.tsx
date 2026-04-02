"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { HelpCircle, Loader2, MessageSquare, X } from "lucide-react";
import { useToast } from "@/lib/toast-context";

// Map path segments to a human-readable page context
function getPageContext(pathname: string): { subject: string; priority: string } {
  if (pathname.includes("/billing")) {
    return { subject: "Help with Billing", priority: "HIGH" };
  }
  if (pathname.includes("/support")) {
    return { subject: "Help with Support", priority: "MEDIUM" };
  }
  if (pathname.includes("/projects")) {
    return { subject: "Help with Projects", priority: "MEDIUM" };
  }
  if (pathname.includes("/analytics")) {
    return { subject: "Help with Analytics & Sites", priority: "MEDIUM" };
  }
  if (pathname.includes("/reports")) {
    return { subject: "Help with Reports", priority: "LOW" };
  }
  if (pathname.includes("/crm")) {
    return { subject: "Help with CRM", priority: "MEDIUM" };
  }
  if (pathname.includes("/booking")) {
    return { subject: "Help with Bookings", priority: "MEDIUM" };
  }
  if (pathname.includes("/brand-vault")) {
    return { subject: "Help with Brand Vault", priority: "LOW" };
  }
  if (pathname.includes("/settings")) {
    return { subject: "Help with Settings", priority: "LOW" };
  }
  return { subject: "Dashboard Help", priority: "MEDIUM" };
}

export function HelpAssistant() {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const context = getPageContext(pathname);

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [formData, setFormData] = useState({
    subject: context.subject,
    description: "",
    priority: context.priority,
    projectId: "",
  });

  // Reset form to current page context when dialog opens or path changes
  useEffect(() => {
    const ctx = getPageContext(pathname);
    setFormData((prev) => ({
      ...prev,
      subject: ctx.subject,
      priority: ctx.priority,
    }));
  }, [pathname, open]);

  // Delay showing button to prevent flash during navigation
  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Failed to create ticket");
      }

      const ticketId = data?.ticket?.id;
      toast.success("Support ticket created!", "We'll get back to you within 24 hours.");
      setOpen(false);
      setFormData((prev) => ({ ...prev, description: "" }));
      if (ticketId) {
        router.push(`/dashboard/web2/support/${ticketId}`);
      }
    } catch (error) {
      toast.error("Failed to create ticket", error instanceof Error ? error.message : "Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  if (!showButton) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open help assistant"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-brand-green text-black shadow-lg hover:bg-brand-green/90 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
      >
        <HelpCircle className="h-6 w-6 group-hover:hidden" />
        <MessageSquare className="h-6 w-6 hidden group-hover:block" />
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-brand-green" />
              Get Help
            </DialogTitle>
            <DialogDescription>
              We&apos;ve pre-filled this form based on where you are. Edit as needed.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="ha-subject">Subject</Label>
              <Input
                id="ha-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ha-priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger id="ha-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low — General question</SelectItem>
                  <SelectItem value="MEDIUM">Medium — Issue affecting work</SelectItem>
                  <SelectItem value="HIGH">High — Urgent / Blocking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ha-description">
                Description <span className="text-text-muted text-xs">(required)</span>
              </Label>
              <Textarea
                id="ha-description"
                placeholder="Describe what you need help with..."
                className="min-h-[120px]"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Ticket
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
