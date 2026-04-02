/**
 * Creates Stripe Products and Prices for MerchantMagix fixed-price offerings.
 * Run once: npm run stripe:create-products
 * Requires: .env with STRIPE_SECRET_KEY set.
 * Output: stripe-products.json with price IDs for use in the app.
 */
import "dotenv/config";
import Stripe from "stripe";
import * as fs from "fs";
import * as path from "path";

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.error("Missing STRIPE_SECRET_KEY in .env");
  process.exit(1);
}

const stripe = new Stripe(secret, { apiVersion: "2023-10-16" });

// Main packages + add-ons (run once; each run creates new products in Stripe)
const PRODUCTS: Array<{
  name: string;
  description?: string;
  priceAmountCents: number;
  recurring?: "month" | "year";
}> = [
  { name: "Shopify Build", description: "Full Shopify store setup and launch", priceAmountCents: 50000 },
  // Custom Build (Website) = custom pricing, contact sales — not a Stripe product
  { name: "Additional revision round", priceAmountCents: 14900 },
  { name: "Extended support (per month)", priceAmountCents: 19900, recurring: "month" },
  { name: "SaaS Monthly Package", description: "Analytics & reporting included", priceAmountCents: 999, recurring: "month" },
];

type Output = Record<string, { productId: string; priceId: string }>;

async function main() {
  const output: Output = {};

  for (const p of PRODUCTS) {
    const product = await stripe.products.create({
      name: p.name,
      description: p.description ?? undefined,
    });

    const price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: p.priceAmountCents,
      ...(p.recurring ? { recurring: { interval: p.recurring } } : {}),
    });

    const key = p.name.replace(/\s*\([^)]*\)\s*/g, "").replace(/\s+/g, "_").toLowerCase();
    output[key] = { productId: product.id, priceId: price.id };
    console.log(`Created: ${p.name} → product ${product.id}, price ${price.id}`);
  }

  const outPath = path.join(process.cwd(), "stripe-products.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\nWrote ${outPath}. Use these price IDs in your app (e.g. checkout or env).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
