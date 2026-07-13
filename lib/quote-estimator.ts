import type { IntakeFormData } from "@/components/intake/intake-form";

export interface QuoteEstimate {
  headline: string;
  priceRange: string;
  timeline: string;
  deliverables: string[];
  note: string;
}

const TYPE_CONFIG: Record<
  string,
  { label: string; low: number; high: number; weeksLow: number; weeksHigh: number; deliverables: string[] }
> = {
  shopify: {
    label: "Shopify Build",
    low: 300,
    high: 900,
    weeksLow: 1,
    weeksHigh: 2,
    deliverables: [
      "Premium theme customized to your brand",
      "Product & collection setup",
      "Payment & shipping configuration",
      "Mobile-optimized, SEO-ready store",
    ],
  },
  "custom-shopify": {
    label: "Custom Shopify Build",
    low: 1000,
    high: 3000,
    weeksLow: 2,
    weeksHigh: 4,
    deliverables: [
      "Custom theme development",
      "Checkout & cart extensions",
      "Advanced app integrations",
      "Conversion-focused UX",
    ],
  },
  "custom-website": {
    label: "Custom Website",
    low: 1000,
    high: 5000,
    weeksLow: 3,
    weeksHigh: 6,
    deliverables: [
      "100% custom design in Figma",
      "React / Next.js build",
      "CMS integration for easy edits",
      "SEO & Core Web Vitals optimized",
    ],
  },
  "app-build": {
    label: "Web / App Build",
    low: 3000,
    high: 15000,
    weeksLow: 6,
    weeksHigh: 12,
    deliverables: [
      "Full-stack architecture",
      "Auth, database & dashboards",
      "API integrations",
      "Web or cross-platform mobile",
    ],
  },
  redesign: {
    label: "Redesign",
    low: 800,
    high: 3000,
    weeksLow: 2,
    weeksHigh: 4,
    deliverables: [
      "Fresh, modern UI",
      "Improved conversion flow",
      "Mobile-first responsive rebuild",
      "Performance optimization",
    ],
  },
  migration: {
    label: "Platform Migration",
    low: 1000,
    high: 4000,
    weeksLow: 2,
    weeksHigh: 5,
    deliverables: [
      "Full data & content migration",
      "Zero-downtime cutover plan",
      "Redirects & SEO preservation",
      "Post-launch monitoring",
    ],
  },
  other: {
    label: "Custom Project",
    low: 500,
    high: 5000,
    weeksLow: 2,
    weeksHigh: 8,
    deliverables: [
      "Scoped to your exact needs",
      "Modern, maintainable build",
      "Regular progress updates",
      "Post-launch support",
    ],
  },
};

// Budget hints nudge the estimate
const BUDGET_MULT: Record<string, number> = {
  "under-5k": 0.85,
  "5k-10k": 1,
  "10k-25k": 1.3,
  "25k-50k": 1.7,
  "50k+": 2.2,
  "not-sure": 1,
};

function fmt(n: number): string {
  return `$${Math.round(n / 50) * 50}`;
}

export function estimateQuote(data: IntakeFormData): QuoteEstimate {
  const cfg = TYPE_CONFIG[data.projectType] ?? TYPE_CONFIG.other;
  const mult = BUDGET_MULT[data.budget ?? "not-sure"] ?? 1;

  const low = cfg.low * mult;
  const high = cfg.high * mult;

  // A rough feature-count bump based on how much they wrote
  const featureText = `${data.features ?? ""} ${data.scope ?? ""} ${data.goals ?? ""}`.trim();
  const complexityBump = featureText.length > 200 ? 1.15 : 1;

  const priceRange = `${fmt(low)} – ${fmt(high * complexityBump)}`;
  const timeline =
    cfg.weeksLow === cfg.weeksHigh
      ? `${cfg.weeksLow} week${cfg.weeksLow > 1 ? "s" : ""}`
      : `${cfg.weeksLow}–${cfg.weeksHigh} weeks`;

  const business = data.businessName?.trim();
  const headline = business
    ? `Here's the plan for ${business}`
    : `Here's what we'd build for you`;

  return {
    headline,
    priceRange,
    timeline,
    deliverables: cfg.deliverables,
    note:
      "This is a rough estimate based on what you shared. We'll confirm exact scope and a fixed quote within 24 hours.",
  };
}
