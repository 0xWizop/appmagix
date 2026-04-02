import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";
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

function generateInvoiceNumber(): string {
  const y = new Date().getFullYear();
  return `INV-${y}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await getOrCreateUserByFirebaseUid(
      session.user.id,
      session.user.email,
      session.user.name
    );
    const invoices = await db.invoice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { project: { select: { name: true } } },
    });
    return NextResponse.json({
      invoices: invoices.map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        amount: i.amount,
        status: i.status,
        description: i.description,
        dueDate: i.dueDate,
        paidAt: i.paidAt,
        createdAt: i.createdAt,
        project: i.project ? { name: i.project.name } : undefined,
        stripePaymentUrl: i.stripePaymentUrl,
        pdfUrl: i.pdfUrl,
      })),
    });
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
    const user = await getOrCreateUserByFirebaseUid(
      session.user.id,
      session.user.email,
      session.user.name
    );

    const body = await req.json();
    const parsed = createInvoiceSchema.safeParse({
      ...body,
      amount: typeof body.amount === "string" ? parseFloat(body.amount) : body.amount,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const { amount, customerEmail, description, projectId, dueDate } = parsed.data;

    if (projectId) {
      const project = await db.project.findFirst({
        where: { id: projectId, userId: user.id },
      });
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
    }

    const amountCents = Math.round(amount * 100);
    const invoice = await db.invoice.create({
      data: {
        userId: user.id,
        projectId: projectId || null,
        invoiceNumber: generateInvoiceNumber(),
        amount: amountCents,
        description: description?.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    let stripePaymentUrl: string | null = null;
    let stripeSessionId: string | null = null;

    if (stripe && amountCents > 0) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001");
      const session = await stripe.checkout.sessions.create({
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
      stripeSessionId = session.id;
      stripePaymentUrl = session.url;
      await db.invoice.update({
        where: { id: invoice.id },
        data: {
          stripePaymentUrl,
          stripeInvoiceId: stripeSessionId,
        },
      });

      // Send email to client
      sendInvoiceCreatedEmail({
        to: customerEmail.trim(),
        clientName: user.name || "there",
        invoiceNumber: invoice.invoiceNumber,
        amount: formatCurrency(amountCents / 100),
        paymentUrl: stripePaymentUrl!,
      }).catch(err => console.error("Failed to send invoice email:", err));
    }

    return NextResponse.json(
      {
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          status: invoice.status,
          description: invoice.description,
          dueDate: invoice.dueDate,
          createdAt: invoice.createdAt,
          stripePaymentUrl: stripePaymentUrl ?? undefined,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
