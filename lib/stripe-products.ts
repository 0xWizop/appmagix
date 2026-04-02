import * as fs from "fs";
import * as path from "path";

export type StripeProducts = Record<string, { productId: string; priceId: string }>;

const SUBSCRIPTION_KEYS = ["extended_support", "saas_monthly_package"];

let cached: StripeProducts | null = null;

export function getStripeProducts(): StripeProducts {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "stripe-products.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  cached = JSON.parse(raw) as StripeProducts;
  return cached;
}

export function getPriceId(productKey: string): string | null {
  const products = getStripeProducts();
  const entry = products[productKey];
  return entry?.priceId ?? null;
}

export function isSubscriptionProduct(productKey: string): boolean {
  return SUBSCRIPTION_KEYS.includes(productKey);
}
