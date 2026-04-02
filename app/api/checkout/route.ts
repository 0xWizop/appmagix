import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPriceId, isSubscriptionProduct } from "@/lib/stripe-products";
import { getSession } from "@/lib/firebase-session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  let body: { product: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const productKey = typeof body.product === "string" ? body.product.trim() : "";
  if (!productKey) {
    return NextResponse.json({ error: "Missing product" }, { status: 400 });
  }

  const priceId = getPriceId(productKey);
  if (!priceId) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001");
  const successUrl = `${baseUrl}/checkout/success`;
  const cancelUrl = `${baseUrl}/checkout/cancel`;

  const isSubscription = isSubscriptionProduct(productKey);
  const session = await getSession();
  const customerEmail = session?.user?.email ?? undefined;
  const metadata: Record<string, string> = {};
  if (customerEmail && isSubscription) {
    metadata.customer_email = customerEmail;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail || undefined,
    subscription_data: isSubscription ? { metadata } : undefined,
    metadata: Object.keys(metadata).length ? metadata : undefined,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
