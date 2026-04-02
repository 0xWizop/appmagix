"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast-context";

interface InvoiceReminderButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  status: string;
}

export function InvoiceReminderButton({ invoiceId, invoiceNumber, status }: InvoiceReminderButtonProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  if (status === "PAID") return null;

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/remind`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      setSent(true);
      toast.success("Reminder sent", `Email sent to client for invoice ${invoiceNumber}.`);
    } catch (err) {
      toast.error("Could not send reminder", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSend}
      disabled={sending || sent}
      className={sent ? "text-brand-green border-brand-green/40" : ""}
    >
      {sending ? (
        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
      ) : sent ? (
        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
      ) : (
        <Mail className="h-3.5 w-3.5 mr-1.5" />
      )}
      {sent ? "Sent" : "Send Reminder"}
    </Button>
  );
}
