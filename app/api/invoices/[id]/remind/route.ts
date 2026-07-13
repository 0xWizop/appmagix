import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getInvoiceById } from "@/lib/firestore";
import { sendInvoiceReminder } from "@/lib/email";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["webmintdevelopment@gmail.com", "merchantmagix@gmail.com"];

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can send reminders (they send to the client)
    const isAdmin = session.user.email && ADMIN_EMAILS.includes(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invoice = await getInvoiceById(params.id);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 });
    }

    const clientEmail = invoice.user?.email;
    if (!clientEmail || clientEmail.endsWith("@placeholder.local")) {
      return NextResponse.json({ error: "Client has no valid email address" }, { status: 400 });
    }

    const result = await sendInvoiceReminder({
      to: clientEmail,
      clientName: invoice.user?.name || "there",
      invoiceNumber: invoice.invoiceNumber,
      amount: formatCurrency(invoice.amount / 100),
      dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : undefined,
      paymentUrl: invoice.stripePaymentUrl ?? undefined,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, sentTo: clientEmail });
  } catch (err) {
    console.error("[invoice/remind]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
