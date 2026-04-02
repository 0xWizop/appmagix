import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    console.error("Stripe or STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let body: string;
  try {
    body = await req.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoiceId;
    if (invoiceId) {
      try {
        await db.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });
      } catch (e) {
        console.error("Failed to update invoice after payment:", e);
        return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
      }
    }
    if (session.mode === "subscription" && session.subscription) {
      const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      const email = session.customer_details?.email ?? session.customer_email ?? session.metadata?.customer_email;
      if (email) {
        const user = await db.user.findFirst({
          where: { email: { equals: email.trim(), mode: "insensitive" } },
        });
        if (user) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await db.subscription.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              stripeSubscriptionId: sub.id,
              stripeCustomerId: sub.customer as string,
              status: sub.status,
              currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
            },
            update: {
              stripeSubscriptionId: sub.id,
              stripeCustomerId: sub.customer as string,
              status: sub.status,
              currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
            },
          });
        }
      }
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const existing = await db.subscription.findUnique({
      where: { stripeSubscriptionId: sub.id },
    });
    if (existing) {
      await db.subscription.update({
        where: { id: existing.id },
        data: {
          status: sub.status,
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
