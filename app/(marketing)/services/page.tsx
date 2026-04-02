import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Code2,
  Palette,
  LineChart,
  Wrench,
  Headphones,
  Smartphone,
  ShoppingBag,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { FloatingTechStack } from "@/components/marketing/floating-tech-stack";

const services = [
  {
    id: "custom-website",
    icon: Globe,
    title: "Custom Websites",
    badge: "Most Popular",
    description:
      "Bespoke marketing sites, portfolios, and content platforms built with React and Next.js. Fast, SEO-ready, and designed to convert.",
    features: [
      "100% custom design",
      "React / Next.js development",
      "SEO & Core Web Vitals optimised",
      "CMS integration (Sanity, Contentful)",
      "Animations & micro-interactions",
      "Hosting on Vercel (often free)",
    ],
  },
  {
    id: "web-app",
    icon: Code2,
    title: "Web Apps & SaaS",
    badge: null,
    description:
      "Full-stack product development — from MVP to production-ready SaaS. Auth, databases, dashboards, and APIs built to scale.",
    features: [
      "React / Next.js frontend",
      "Node.js / Prisma backend",
      "Auth (NextAuth, Firebase)",
      "PostgreSQL / Firestore",
      "REST & GraphQL APIs",
      "Admin dashboards",
    ],
  },
  {
    id: "mobile",
    icon: Smartphone,
    title: "Mobile Apps",
    badge: null,
    description:
      "Cross-platform mobile apps built with React Native. One codebase, native performance on iOS and Android.",
    features: [
      "React Native (iOS & Android)",
      "App Store & Play Store publishing",
      "Push notifications",
      "Offline-first architecture",
      "Device integrations (camera, GPS)",
      "Shared codebase with web",
    ],
  },
  {
    id: "ecommerce",
    icon: ShoppingBag,
    title: "E-Commerce",
    badge: null,
    description:
      "Custom storefronts on any platform — Shopify, headless Next.js Commerce, WooCommerce, or fully bespoke. We're platform-agnostic.",
    features: [
      "Custom storefront design",
      "Shopify / WooCommerce / headless",
      "Checkout & payment setup",
      "Product & inventory management",
      "Store migrations",
      "Conversion optimisation",
    ],
  },
  {
    id: "design",
    icon: Palette,
    title: "UI/UX Design",
    badge: null,
    description:
      "Conversion-focused digital design. From brand identity to interactive prototypes — every pixel serves a purpose.",
    features: [
      "Brand identity & logo",
      "UI/UX design (Figma)",
      "Wireframing & prototyping",
      "Design systems",
      "Mobile-first",
      "A/B testing designs",
    ],
  },
  {
    id: "support",
    icon: Headphones,
    title: "Maintenance & Support",
    badge: null,
    description:
      "Ongoing care for your digital products — updates, monitoring, and fast responses when you need them.",
    features: [
      "Priority support tickets",
      "Security updates",
      "Performance monitoring",
      "Feature updates",
      "Monthly check-ins",
      "Emergency hotfixes",
    ],
  },
];

const techStack = [
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "React Native", category: "Mobile" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "Node.js", category: "Backend" },
  { name: "Prisma", category: "Database" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Firebase", category: "Backend" },
  { name: "Sanity", category: "CMS" },
  { name: "Shopify", category: "E-Commerce" },
  { name: "Stripe", category: "Payments" },
  { name: "Vercel", category: "Hosting" },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section-padding pt-24">
        <div className="container-width">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4">Our Services</Badge>
            <h1 className="text-4xl sm:text-5xl font-medium mb-6">
              Custom websites, apps,{" "}
              <span className="gradient-text">and everything in between</span>
            </h1>
            <p className="text-lg text-text-secondary">
              We design and build digital products — from marketing sites and SaaS platforms
              to mobile apps and custom e-commerce storefronts. No templates, no shortcuts.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding pt-0">
        <div className="container-width">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                id={service.id}
                className="group hover:border-brand-green/50 transition-colors scroll-mt-24 relative"
              >
                {service.badge && (
                  <div className="absolute -top-2.5 left-4">
                    <Badge className="bg-brand-green text-black text-xs font-semibold">
                      {service.badge}
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-brand-green/20 flex items-center justify-center mb-4 group-hover:bg-brand-green/30 transition-colors">
                    <service.icon className="h-6 w-6 text-brand-green" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">{service.title}</h3>
                  <p className="text-text-secondary text-sm mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                        <CheckCircle className="h-4 w-4 text-brand-green shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section — Interactive & Floating */}
      <section className="section-padding bg-surface overflow-hidden">
        <div className="container-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-4 underline decoration-brand-green/30 underline-offset-8">
              Our Tech Stack
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Modern, battle-tested tools chosen for performance, developer experience, 
              and long-term maintainability. Hover to interact.
            </p>
          </div>
          
          <FloatingTechStack />
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding">
        <div className="container-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-4">How We Work</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              A proven process that delivers results on time, every time
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Discovery & Strategy",
                  description:
                    "We start with a deep dive into your business, goals, target audience, and existing tech. This shapes everything we build.",
                  duration: "1 week",
                },
                {
                  step: "02",
                  title: "Design & Prototyping",
                  description:
                    "Custom designs tailored to your brand. You'll review interactive prototypes before a single line of code is written.",
                  duration: "1–2 weeks",
                },
                {
                  step: "03",
                  title: "Development & Testing",
                  description:
                    "We build with clean, scalable code. Rigorous QA across devices and browsers ensures everything works perfectly.",
                  duration: "2–4 weeks",
                },
                {
                  step: "04",
                  title: "Launch & Support",
                  description:
                    "Smooth handoff with full documentation and post-launch support. We're here if anything needs attention.",
                  duration: "1 week",
                },
              ].map((phase, index) => (
                <div key={phase.step} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green font-medium">
                      {phase.step}
                    </div>
                    {index < 3 && <div className="w-px h-full bg-border mt-2" />}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-medium">{phase.title}</h3>
                      <Badge variant="secondary">{phase.duration}</Badge>
                    </div>
                    <p className="text-text-secondary">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-surface">
        <div className="container-width">
          <Card className="bg-gradient-to-br from-brand-green/20 via-transparent to-transparent border-brand-green/30">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-medium mb-4">
                Ready to build something great?
              </h2>
              <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                Tell us about your project and we&apos;ll get back to you within 24 hours with a plan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" asChild>
                  <Link href="/contact">
                    Start a Project
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
