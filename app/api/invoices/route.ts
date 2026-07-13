import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { getInvoicesByUser, createInvoice, updateInvoice } from "@/lib/firestore";
import { stripe } from "@/lib/stripe";
import { sendInvoiceCreatedEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createInvoiceSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  customerEmail: z.string().email("Valid client email is required"),
  description: z.string().optional(),
  projectId: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const invoices = await getInvoicesByUser(session.user.id);
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await getOrCreateUserByFirebaseUid(session.user.id, session.user.email, session.user.name);

    const body = await req.json();
    const parsed = createInvoiceSchema.safeParse({
      ...body,
      amount: typeof body.amount === "string" ? parseFloat(body.amount) : body.amount,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const { amount, customerEmail, description, projectId, dueDate } = parsed.data;

    const amountCents = Math.round(amount * 100);
    const invoice = await createInvoice({
      userId: session.user.id,
      projectId: projectId || undefined,
      amount: amountCents,
      description: description?.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    let stripePaymentUrl: string | null = null;

    if (stripe && amountCents > 0) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001");
      const checkout = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: customerEmail.trim(),
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: amountCents,
              product_data: {
                name: invoice.invoiceNumber,
                description: description?.trim() || "Invoice for services",
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/dashboard/web2/billing?paid=1`,
        cancel_url: `${baseUrl}/dashboard/web2/billing`,
        metadata: { invoiceId: invoice.id },
      });
      stripePaymentUrl = checkout.url;
      await updateInvoice(invoice.id, { stripePaymentUrl: stripePaymentUrl ?? undefined });

      sendInvoiceCreatedEmail({
        to: customerEmail.trim(),
        clientName: user.name || "there",
        invoiceNumber: invoice.invoiceNumber,
        amount: formatCurrency(amountCents / 100),
        paymentUrl: stripePaymentUrl!,
      }).catch((err) => console.error("Failed to send invoice email:", err));
    }

    return NextResponse.json(
      { invoice: { ...invoice, stripePaymentUrl: stripePaymentUrl ?? undefined } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
