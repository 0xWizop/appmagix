"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Globe, Code2, ArrowRight, Layout, ShoppingBag, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckoutButton } from "@/components/checkout-button";

const customFeatures = [
  "100% custom design",
  "Unlimited pages",
  "React / Next.js build",
  "Headless CMS integration",
  "SEO & performance-optimised",
  "Custom integrations",
];

const ecommerceFeatures = [
  "Custom storefront design",
  "Product & collection pages",
  "Cart & checkout flow",
  "Payment gateway setup",
  "Inventory management",
  "Works with any platform",
];

type BillingCycle = "monthly" | "yearly";

export function PricingToggle() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  const saasMonthlyPrice = billing === "yearly" ? "$7.99" : "$9.99";
  const saasYearlyNote = billing === "yearly" ? "billed annually" : "/month";

  return (
    <div className="space-y-8">
      {/* Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={cn("text-sm font-medium transition-colors", billing === "monthly" ? "text-white" : "text-text-muted")}>
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={billing === "yearly"}
          onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 focus:ring-offset-background",
            billing === "yearly" ? "bg-brand-green" : "bg-surface-hover"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200",
              billing === "yearly" ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium transition-colors", billing === "yearly" ? "text-white" : "text-text-muted")}>
            Yearly
          </span>
          {billing === "yearly" && (
            <Badge className="bg-brand-green/20 text-brand-green border border-brand-green/30 text-xs animate-in fade-in duration-200">
              Save 20%
            </Badge>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {/* Custom Website — Hero card (Most Popular) */}
        <Card
          className="relative shadow-none border-brand-green flex flex-col bg-surface"
          style={{ boxShadow: "0 0 0 1px #00D166, 0 0 28px 6px rgba(0,209,102,0.15)" }}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <Badge className="bg-brand-green text-black font-semibold shadow-lg px-3">
              ✦ Most Popular
            </Badge>
          </div>
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-brand-green-dark flex items-center justify-center mb-4">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Custom Website</CardTitle>
            <CardDescription>
              Bespoke React / Next.js build tailored to your brand and business goals.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <ul className="space-y-3 mb-6 flex-1">
              {customFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 mt-auto pt-2">
              <div className="shrink-0">
                <span className="text-3xl font-semibold">$1,500</span>
                <p className="text-xs text-text-muted leading-none mt-0.5">starting price</p>
              </div>
              <CheckoutButton productKey="custom_website_build" className="flex-1 whitespace-nowrap">
                Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
              </CheckoutButton>
            </div>
            <p className="text-xs text-text-muted text-center mt-3">
              Need a web app?{" "}
              <Link href="/contact?plan=custom-app" className="text-brand-green underline">
                Get a quote
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* E-Commerce Build */}
        <Card className="relative shadow-none border-border flex flex-col">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-brand-green-dark flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">E-Commerce Build</CardTitle>
            <CardDescription>
              Custom storefronts built on Shopify, Next.js Commerce, or a platform of your choice.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <ul className="space-y-3 mb-6 flex-1">
              {ecommerceFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 mt-auto pt-2">
              <div className="shrink-0">
                <span className="text-3xl font-semibold">$500</span>
                <p className="text-xs text-text-muted leading-none mt-0.5">+ platform fee</p>
              </div>
              <CheckoutButton productKey="shopify_build" className="flex-1 whitespace-nowrap">
                Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
              </CheckoutButton>
            </div>
            <p className="text-xs text-text-muted text-center mt-3">
              Shopify, WooCommerce, custom — your call.
            </p>
          </CardContent>
        </Card>

        {/* SaaS Monthly */}
        <Card className="relative shadow-none border-border flex flex-col">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-brand-green-dark flex items-center justify-center mb-4">
              <Layout className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">SaaS Monthly</CardTitle>
            <CardDescription>Analytics & reporting, dashboard access, and ongoing tools</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
                Analytics & reporting
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
                Client dashboard & tools
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
                Cancel anytime
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-auto pt-2">
              <div className="shrink-0">
                <span className="text-3xl font-semibold transition-all duration-300">{saasMonthlyPrice}</span>
                <p className="text-xs text-text-muted leading-none mt-0.5">
                  {billing === "yearly" ? "2 months free!" : "/month"}
                </p>
                {billing === "yearly" && (
                  <p className="text-[10px] text-brand-green animate-in fade-in duration-200">{saasYearlyNote}</p>
                )}
              </div>
              <CheckoutButton productKey="saas_monthly_package" className="flex-1 whitespace-nowrap">
                Subscribe <ArrowRight className="ml-1.5 h-4 w-4" />
              </CheckoutButton>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
