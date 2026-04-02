"use client";

import * as React from "react";
import { CheckCircle, Calculator, ChevronRight, Globe, Code2, ShoppingBag, Smartphone, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Project Types ────────────────────────────────────────────────────────────
interface ProjectType {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  basePrice: number;
  baseLabel: string;
}

const PROJECT_TYPES: ProjectType[] = [
  {
    id: "custom-website",
    label: "Custom Website",
    icon: Globe,
    description: "Marketing site, portfolio, or content-heavy platform built with React/Next.js",
    basePrice: 1500,
    baseLabel: "Design + development",
  },
  {
    id: "web-app",
    label: "Web App / SaaS",
    icon: Code2,
    description: "Full-stack application with auth, database, dashboards, and user flows",
    basePrice: 3000,
    baseLabel: "MVP build",
  },
  {
    id: "ecommerce",
    label: "E-Commerce Store",
    icon: ShoppingBag,
    description: "Custom storefront on Shopify, Next.js Commerce, WooCommerce, or headless",
    basePrice: 500,
    baseLabel: "Store setup",
  },
  {
    id: "mobile-app",
    label: "Mobile App",
    icon: Smartphone,
    description: "React Native app for iOS and Android from a single codebase",
    basePrice: 5000,
    baseLabel: "Cross-platform build",
  },
  {
    id: "redesign",
    label: "Redesign / Rebrand",
    icon: Layers,
    description: "UI overhaul or brand refresh for an existing website or product",
    basePrice: 800,
    baseLabel: "Redesign scope",
  },
];

// ─── Add-ons (contextual by project type) ────────────────────────────────────
interface Feature {
  id: string;
  label: string;
  price: number;
  description: string;
  category: string;
  forTypes?: string[]; // undefined = available for all
}

const FEATURES: Feature[] = [
  // Design
  { id: "logo-design", label: "Logo Design", price: 149, description: "3 concepts, 2 revision rounds, all file formats", category: "Design" },
  { id: "brand-kit", label: "Brand Kit", price: 99, description: "Color palette, typography guide and usage docs", category: "Design" },
  { id: "custom-animations", label: "Custom Animations", price: 199, description: "Scroll-driven entrance and micro-interaction animations", category: "Design" },
  { id: "ui-kit", label: "UI Component Library", price: 299, description: "Reusable design system component library in Figma + code", category: "Design", forTypes: ["custom-website", "web-app", "mobile-app"] },
  // Pages & Content
  { id: "extra-pages", label: "Extra Pages (×3)", price: 149, description: "Three additional custom-designed pages beyond the standard set", category: "Content", forTypes: ["custom-website", "ecommerce", "redesign"] },
  { id: "blog-setup", label: "Blog / News Setup", price: 99, description: "Blog with categories, RSS feed, and SEO-optimized structure", category: "Content", forTypes: ["custom-website", "redesign"] },
  { id: "landing-page", label: "Marketing Landing Page", price: 149, description: "High-converting landing page with A/B-ready section structure", category: "Content" },
  { id: "copywriting", label: "Copywriting (5 pages)", price: 249, description: "Professional web copy written by our content team", category: "Content" },
  // Dev & Integrations
  { id: "crm-integration", label: "CRM Integration", price: 199, description: "Connect HubSpot, Salesforce, or your CRM to capture leads", category: "Dev" },
  { id: "checkout-ext", label: "Checkout Customization", price: 249, description: "Custom upsells, logic, or UI in your checkout flow", category: "Dev", forTypes: ["ecommerce"] },
  { id: "payment-gateway", label: "Payment Gateway", price: 99, description: "Stripe, PayPal, Klarna, or Afterpay integration", category: "Dev" },
  { id: "auth-system", label: "Auth & User Accounts", price: 299, description: "Email/social login, user profiles, and role-based access", category: "Dev", forTypes: ["web-app", "mobile-app"] },
  { id: "api-integration", label: "Third-party API", price: 199, description: "Connect any external API or data source to your product", category: "Dev" },
  // Marketing & SEO
  { id: "seo-audit", label: "SEO Audit & Setup", price: 99, description: "Schema markup, meta optimization, and sitemap configuration", category: "Marketing" },
  { id: "analytics-setup", label: "GA4 + Pixel Setup", price: 79, description: "Google Analytics 4, Meta Pixel, and conversion event tracking", category: "Marketing" },
  // Support
  { id: "post-launch", label: "60-Day Priority Support", price: 299, description: "Priority bug fixes, updates, and on-call assistance post-launch", category: "Support" },
];

const CATEGORIES = ["Design", "Content", "Dev", "Marketing", "Support"];

export function PricingCalculator() {
  const [selectedType, setSelectedType] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [activeCategory, setActiveCategory] = React.useState<string>("All");

  const projectType = PROJECT_TYPES.find((p) => p.id === selectedType);

  const toggleFeature = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const availableFeatures = FEATURES.filter(
    (f) => !f.forTypes || !selectedType || f.forTypes.includes(selectedType)
  );

  const visibleFeatures =
    activeCategory === "All"
      ? availableFeatures
      : availableFeatures.filter((f) => f.category === activeCategory);

  const basePrice = projectType?.basePrice ?? 0;
  const addOnsTotal = FEATURES.filter((f) => selected.includes(f.id)).reduce((acc, f) => acc + f.price, 0);
  const totalPrice = basePrice + addOnsTotal;

  // Clear selected add-ons when project type changes
  const handleTypeSelect = (id: string) => {
    setSelectedType(id === selectedType ? null : id);
    setSelected([]);
    setActiveCategory("All");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Left — configurator */}
      <div className="space-y-6">

        {/* Step 1 — Project Type */}
        <div>
          <Badge variant="outline" className="mb-2 border-brand-green/30 text-brand-green">Step 1</Badge>
          <h3 className="text-xl font-medium mb-1">What are you building?</h3>
          <p className="text-sm text-text-secondary mb-4">Select the type of project to see a relevant base price and add-ons.</p>
          <div className="grid gap-2.5">
            {PROJECT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                    isSelected
                      ? "bg-brand-green/5 border-brand-green shadow-[0_0_16px_rgba(0,209,102,0.08)]"
                      : "bg-surface border-border hover:border-brand-green/30"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? "bg-brand-green text-black" : "bg-surface-hover text-text-muted"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-medium text-sm">{type.label}</span>
                      <span className={cn("text-xs font-semibold shrink-0 ml-2", isSelected ? "text-brand-green" : "text-text-muted")}>
                        from ${type.basePrice.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">{type.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — Add-ons (only show after project type is selected) */}
        {selectedType && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <Badge variant="outline" className="mb-2 border-brand-green/30 text-brand-green">Step 2</Badge>
            <h3 className="text-xl font-medium mb-1">Add what you need</h3>
            <p className="text-sm text-text-secondary mb-4">Prices are fixed — no hourly surprises.</p>

            {/* Category filter */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {["All", ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs border transition-colors",
                    activeCategory === cat
                      ? "bg-brand-green/20 border-brand-green/40 text-brand-green"
                      : "bg-surface border-border text-text-muted hover:text-text-primary"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid gap-2.5">
              {visibleFeatures.map((feature) => {
                const isSelected = selected.includes(feature.id);
                return (
                  <button
                    key={feature.id}
                    onClick={() => toggleFeature(feature.id)}
                    className={cn(
                      "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all",
                      isSelected
                        ? "bg-brand-green/5 border-brand-green shadow-[0_0_16px_rgba(0,209,102,0.08)]"
                        : "bg-surface border-border hover:border-brand-green/30"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected ? "bg-brand-green border-brand-green" : "border-border"
                    )}>
                      {isSelected && <CheckCircle className="h-2.5 w-2.5 text-black" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-medium text-sm">{feature.label}</span>
                        <span className="text-xs font-semibold text-brand-green shrink-0 ml-2">+${feature.price}</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">{feature.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right — sticky quote summary */}
      <div className="lg:sticky lg:top-24">
        <Card className="border-brand-green/20 bg-gradient-to-br from-brand-green/5 to-surface shadow-2xl">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-brand-green-dark flex items-center justify-center mb-4">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <CardTitle>Your Custom Quote</CardTitle>
            <CardDescription>
              {selectedType ? `Based on: ${projectType?.label}` : "Select a project type to begin"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {!selectedType ? (
                <div className="py-6 text-center text-text-muted text-sm">
                  ← Choose a project type to see your estimate
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm py-2 border-b border-border/50">
                    <span className="text-text-secondary">{projectType?.baseLabel}</span>
                    <span>${projectType?.basePrice.toLocaleString()}</span>
                  </div>
                  {selected.length === 0 && (
                    <p className="text-xs text-text-muted italic py-1">No add-ons selected yet.</p>
                  )}
                  {selected.map((id) => {
                    const f = FEATURES.find((f) => f.id === id);
                    return (
                      <div key={id} className="flex justify-between text-sm py-1">
                        <span className="text-text-secondary truncate mr-2">{f?.label}</span>
                        <span className="shrink-0">+${f?.price}</span>
                      </div>
                    );
                  })}
                  <div className="pt-4 mt-2 border-t border-brand-green/20 flex justify-between items-baseline">
                    <span className="text-lg font-medium">Estimated Total</span>
                    <span className="text-4xl font-semibold text-brand-green">
                      ${totalPrice.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
              <div className="pt-4 space-y-3">
                <Button className="w-full h-12 text-base font-medium" size="lg" disabled={!selectedType}>
                  Submit Quote Request
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-[10px] text-center text-text-muted leading-tight">
                  Non-binding estimate. We&apos;ll review and send a formal proposal within 24 hours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
