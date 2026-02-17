import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedCta } from "@/components/marketing/animated-cta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MotionAnimateIn } from "@/components/marketing/motion-animate-in";
import { HeroSection } from "@/components/marketing/hero-section";
import { HoverCard } from "@/components/marketing/hover-card";
import { FeatureCard } from "@/components/marketing/feature-card";
import { ProcessTabs } from "@/components/marketing/process-tabs";
import { IntakeForm } from "@/components/intake/intake-form";
import {
  ArrowRight,
  CheckCircle,
  ShoppingBag,
  Code2,
  MessageSquare,
  Zap,
  Shield,
  TrendingUp,
  Package,
  Globe,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: "ShoppingBag" as const,
    title: "Ecommerce & Shopify",
    description:
      "We've built 100+ Shopify stores and ecommerce sites. From simple setups to complex customizations—we know stores inside out.",
  },
  {
    icon: "Code2" as const,
    title: "Web & App Development",
    description:
      "Custom web apps, SaaS products, and websites with React, Next.js, and modern tech. Not just ecommerce.",
  },
  {
    icon: "Palette" as const,
    title: "Stunning Design",
    description:
      "Beautiful, conversion-focused design that makes your brand stand out—for stores, apps, or marketing sites.",
  },
  {
    icon: "Rocket" as const,
    title: "Fast Delivery",
    description:
      "We respect your time. Most projects launch within 2-4 weeks, not months.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Discovery",
    description:
      "We start by understanding your business, goals, and vision. No pressure, no sales pitch—just an honest conversation about what you need and how we can help.",
    details: [
      "Free 30-minute consultation to discuss your project",
      "We review your brand, target audience, and competitors",
      "Scope and timeline defined—you know exactly what to expect",
      "Transparent pricing with no hidden fees",
    ],
  },
  {
    step: "02",
    title: "Design",
    description:
      "Before we write a single line of code, you'll see exactly what you're getting. Custom mockups and prototypes ensure we're aligned before development begins.",
    details: [
      "Wireframes and mockups tailored to your brand",
      "Interactive prototypes for key flows (checkout, product pages)",
      "Revisions included until you're 100% happy",
      "Design system built for consistency and scalability",
    ],
  },
  {
    step: "03",
    title: "Build",
    description:
      "We develop your store or app with clean code, fast performance, and a mobile-first approach. You'll get regular updates and can test as we go.",
    details: [
      "Modern stack: React, Next.js, Shopify—built to last",
      "Mobile-first and responsive across all devices",
      "Weekly check-ins so you're never in the dark",
      "Access to staging environment to preview changes",
    ],
  },
  {
    step: "04",
    title: "Launch",
    description:
      "Thorough testing, SEO setup, and a smooth handoff. We don't disappear after launch—ongoing support and maintenance when you need it.",
    details: [
      "Full QA and cross-browser testing before go-live",
      "SEO optimization so you can be found on Google",
      "Training and documentation for your team",
      "Post-launch support and optional retainer for updates",
    ],
  },
];

const productOptions = [
  {
    icon: ShoppingBag,
    title: "Shopify Build",
    price: "$500",
    priceLabel: "starting at",
    description: "Fast, reliable, and perfect for most businesses. We customize premium themes to match your brand perfectly.",
    features: [
      "Premium theme customization",
      "App integrations setup",
      "Payment & shipping config",
      "SEO optimization",
    ],
  },
  {
    icon: Code2,
    title: "Custom Shopify Build",
    price: "$1,500",
    priceLabel: "starting at",
    description: "Heavily customized Shopify stores—custom themes, checkout extensions, and unique functionality built for your needs.",
    features: [
      "Custom theme development",
      "Checkout & cart extensions",
      "Advanced app integrations",
      "Dedicated developer support",
    ],
  },
  {
    icon: Globe,
    title: "Custom Website",
    price: "Custom",
    priceLabel: "contact for quote",
    description: "Fully custom websites built from scratch. Marketing sites, portfolios, or unique web experiences.",
    features: [
      "100% custom design & code",
      "React/Next.js powered",
      "Headless CMS ready",
      "Fast, mobile-first build",
    ],
  },
  {
    icon: Smartphone,
    title: "App Build",
    price: "Custom",
    priceLabel: "contact for quote",
    description: "Custom web apps, SaaS products, and Shopify apps. Built to scale with your business.",
    features: [
      "Web & mobile-responsive apps",
      "Shopify app development",
      "API integrations",
      "Ongoing maintenance options",
    ],
  },
];

const comparisonFeatures = [
  { feature: "Starting Price", shopify: "$500", customShopify: "$1,500", customWebsite: "Custom", appBuild: "Custom" },
  { feature: "Timeline", shopify: "1–2 weeks", customShopify: "2–4 weeks", customWebsite: "4–8 weeks", appBuild: "Varies" },
  { feature: "Theme Customization", shopify: "Premium themes", customShopify: "Custom themes", customWebsite: "100% custom", appBuild: "—" },
  { feature: "Checkout Extensions", shopify: "—", customShopify: "✓", customWebsite: "—", appBuild: "—" },
  { feature: "App Integrations", shopify: "Setup only", customShopify: "Advanced", customWebsite: "As needed", appBuild: "Core feature" },
  { feature: "Payment & Shipping", shopify: "✓", customShopify: "✓", customWebsite: "If ecommerce", appBuild: "—" },
  { feature: "SEO Optimization", shopify: "✓", customShopify: "✓", customWebsite: "✓", appBuild: "As needed" },
  { feature: "Headless CMS", shopify: "—", customShopify: "Optional", customWebsite: "✓", appBuild: "As needed" },
  { feature: "Shopify App Dev", shopify: "—", customShopify: "—", customWebsite: "—", appBuild: "✓" },
  { feature: "Best For", shopify: "Quick launch", customShopify: "Unique store needs", customWebsite: "Marketing sites", appBuild: "SaaS & apps" },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "App & Website Builder | Custom Apps, Sites & Ecommerce",
    description:
      "MerchantMagix builds custom web apps, websites, and ecommerce experiences. From Shopify stores to SaaS products—we build what you need. Ecommerce-focused, platform-agnostic.",
    openGraph: {
      title: "App & Website Builder | MerchantMagix",
      description:
        "Custom web apps, websites, and ecommerce. Shopify builds from $799, custom from $2,499. Plus Shopify mini apps to power your store.",
      url: "/",
    },
  };
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* What We Build Section */}
      <section className="section-padding bg-surface">
        <div className="container-width">
          <MotionAnimateIn animation="fadeUp" rootMargin="0px 0px -60px 0px">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-medium mb-4">
                Build your store or your app
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Shopify builds, custom stores, websites, and apps. Choose the option
                that fits your needs—each built with care and modern tech.
              </p>
            </div>
          </MotionAnimateIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {productOptions.map((product, i) => (
              <MotionAnimateIn key={product.title} delay={100 + i * 80} animation="fadeUp" className="h-full">
                <HoverCard className={`h-full flex flex-col ${i === 0 ? "border-brand-green/30" : ""}`}>
                  {i === 0 && (
                    <div className="absolute top-4 right-4">
                      <Badge>From $500</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col flex-1 min-h-0">
                    <div className="h-12 w-12 rounded-xl bg-brand-green/20 flex items-center justify-center mb-4 shrink-0">
                      <product.icon className="h-6 w-6 text-brand-green" />
                    </div>
                    <h3 className="text-xl font-medium mb-2 shrink-0">{product.title}</h3>
                    <p className="text-text-secondary text-sm mb-4 line-clamp-3 min-h-[3.75rem]">
                      {product.description}
                    </p>
                    <ul className="space-y-2 mb-6 flex-1 min-h-0">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-brand-green shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-baseline gap-2 mb-4 shrink-0">
                      <span className="text-2xl font-medium">{product.price}</span>
                      <span className="text-text-muted text-sm">{product.priceLabel}</span>
                    </div>
                    <Button className="w-full shrink-0" asChild>
                      <Link href={product.price.startsWith("$") ? "/pricing" : "/contact"}>
                        {product.price.startsWith("$") ? "Learn More" : "Get a Quote"}
                      </Link>
                    </Button>
                  </CardContent>
                </HoverCard>
              </MotionAnimateIn>
            ))}
          </div>

          {/* Comparison Table */}
          <MotionAnimateIn animation="fadeUp" delay={200}>
            <Card className="shadow-none mt-12">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-text-secondary">What you get</th>
                      <th className="text-center p-4 font-medium">Shopify</th>
                      <th className="text-center p-4 font-medium">Custom Shopify</th>
                      <th className="text-center p-4 font-medium">Custom Website</th>
                      <th className="text-center p-4 font-medium">App Build</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((row, i) => (
                      <tr
                        key={row.feature}
                        className={i !== comparisonFeatures.length - 1 ? "border-b border-border" : ""}
                      >
                        <td className="p-4 text-text-secondary">{row.feature}</td>
                        <td className="p-4 text-center">{row.shopify}</td>
                        <td className="p-4 text-center">{row.customShopify}</td>
                        <td className="p-4 text-center">{row.customWebsite}</td>
                        <td className="p-4 text-center">{row.appBuild}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </MotionAnimateIn>
        </div>
      </section>

      {/* Features Section — Why choose merchantmagix */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_50%,rgba(34,197,94,0.04),transparent)] pointer-events-none" />
        <div className="container-width relative">
          <MotionAnimateIn animation="fadeUp" rootMargin="0px 0px -60px 0px">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-medium mb-4">
                Why choose merchantmagix?
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                We build apps and websites of all kinds—with deep expertise in
                ecommerce and Shopify so your store or product stands out.
              </p>
            </div>
          </MotionAnimateIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {features.map((feature, i) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Process Section — How we work */}
      <section className="section-padding bg-brand-green relative overflow-hidden">
        <div className="container-width relative">
          <MotionAnimateIn animation="fadeUp" rootMargin="0px 0px -60px 0px">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-medium mb-4 text-black">
                How we work
              </h2>
              <p className="text-black/85 max-w-2xl mx-auto text-lg">
                A simple, transparent process from first call to launch day. No surprises—you&apos;ll
                know exactly what to expect at every step. Click each phase to learn more.
              </p>
              <p className="text-black/75 max-w-xl mx-auto mt-4 text-sm">
                Most projects move from discovery to launch in 2–4 weeks. We keep you updated
                weekly and never leave you guessing.
              </p>
            </div>
          </MotionAnimateIn>

          <MotionAnimateIn animation="fadeUp" delay={100}>
            <ProcessTabs steps={processSteps} />
          </MotionAnimateIn>
        </div>
      </section>

      {/* Shopify Apps Section */}
      <section className="section-padding bg-surface">
        <div className="container-width">
          <MotionAnimateIn animation="fadeUp" rootMargin="0px 0px -60px 0px">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-medium mb-4">
                Our Shopify Mini Apps
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Power your store with our own Shopify apps. More coming soon.
              </p>
            </div>
          </MotionAnimateIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { name: "App One", tagline: "Coming soon", icon: Package },
              { name: "App Two", tagline: "Coming soon", icon: Package },
              { name: "App Three", tagline: "Coming soon", icon: Package },
              { name: "App Four", tagline: "Coming soon", icon: Package },
            ].map((app, i) => (
              <MotionAnimateIn key={app.name} delay={i * 80} animation="fadeUp">
                <HoverCard className="h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-xl bg-brand-green/20 flex items-center justify-center mb-4 group-hover:bg-brand-green/30 transition-colors">
                      <app.icon className="h-6 w-6 text-brand-green" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">{app.name}</h3>
                    <p className="text-sm text-text-muted mb-4">{app.tagline}</p>
                    <Badge variant="secondary" className="text-xs">
                      Shopify
                    </Badge>
                  </CardContent>
                </HoverCard>
              </MotionAnimateIn>
            ))}
          </div>

          <div className="text-center">
            <AnimatedCta href="/apps" variant="primary" size="lg">
              View All Apps
            </AnimatedCta>
          </div>
        </div>
      </section>

      {/* Intake Form Section - for logged-out visitors */}
      <section id="intake" className="section-padding bg-surface scroll-mt-24">
        <div className="container-width">
          <MotionAnimateIn animation="fadeUp" rootMargin="0px 0px -80px 0px">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <Badge variant="secondary" className="mb-4 bg-brand-green/20 text-brand-green border border-brand-green/50">
                  No calls required
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-medium mb-4">
                  Start with a form
                </h2>
                <p className="text-text-secondary max-w-xl mx-auto">
                  Tell us about your project. We&apos;ll review and respond within 24 hours via email.
                </p>
              </div>
              <IntakeForm />
            </div>
          </MotionAnimateIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-width">
          <MotionAnimateIn animation="fadeUp" rootMargin="0px 0px -80px 0px">
          <Card className="bg-gradient-to-br from-brand-green/10 via-surface to-surface border-brand-green/20 shadow-none">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-medium mb-4">
                  Ready to build your dream store?
                </h2>
                <p className="text-text-secondary mb-8">
                  Let&apos;s talk about your project. Free consultation, no
                  pressure, just honest advice on the best path forward.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <AnimatedCta href="/#intake" variant="primary" size="lg">
                    <MessageSquare className="mr-2 h-5 w-5 inline" />
                    Start with a Form
                  </AnimatedCta>
                  <AnimatedCta href="/pricing" variant="outline" size="lg" showArrow={false}>
                    View Pricing
                  </AnimatedCta>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-brand-green" />
                    <span>No upfront payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-brand-green" />
                    <span>ROI focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-brand-green" />
                    <span>Quick turnaround</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </MotionAnimateIn>
        </div>
      </section>
    </div>
  );
}
