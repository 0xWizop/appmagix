"use client";

import Link from "next/link";
import { CheckCircle, Code2, ArrowRight, ShoppingBag, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export function PricingToggle() {
  return (
    <div className="space-y-8">
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
                <span className="text-3xl font-semibold">$1,000</span>
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
                <span className="text-3xl font-semibold">$300</span>
                <p className="text-xs text-text-muted leading-none mt-0.5">starting price</p>
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

        {/* App / Custom Build */}
        <Card className="relative shadow-none border-border flex flex-col">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-brand-green-dark flex items-center justify-center mb-4">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">App Build</CardTitle>
            <CardDescription>Web apps, SaaS products, and mobile apps built to scale.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <ul className="space-y-3 mb-6 flex-1">
              {[
                "Full-stack web apps",
                "React Native mobile apps",
                "API integrations",
                "Auth & user management",
                "Admin dashboards",
                "Ongoing maintenance options",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 mt-auto pt-2">
              <div className="shrink-0">
                <span className="text-3xl font-semibold">Custom</span>
                <p className="text-xs text-text-muted leading-none mt-0.5">contact for quote</p>
              </div>
              <Link href="/contact" className="flex-1">
                <button className="w-full whitespace-nowrap inline-flex items-center justify-center rounded-md bg-brand-green text-black font-medium text-sm px-4 py-2 hover:bg-brand-green/90 transition-colors">
                  Get a Quote <ArrowRight className="ml-1.5 h-4 w-4" />
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
