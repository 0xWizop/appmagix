import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/firebase-session";

export const dynamic = "force-dynamic";

// One-off product price IDs — update these with your real Stripe price IDs
const PRICE_MAP: Record<string, string> = {
  additional_revision_round: process.env.STRIPE_PRICE_REVISION ?? "",
  extended_support: process.env.STRIPE_PRICE_SUPPORT ?? "",
};

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
  const priceId = PRICE_MAP[productKey];
  if (!priceId) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001");

  const session = await getSession();
  const customerEmail = session?.user?.email ?? undefined;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/checkout/success`,
    cancel_url: `${baseUrl}/checkout/cancel`,
    customer_email: customerEmail || undefined,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
