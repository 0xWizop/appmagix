import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Code2,
  Palette,
  LineChart,
  Wrench,
  Headphones,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    id: "shopify",
    icon: ShoppingBag,
    title: "Shopify Development",
    description:
      "Expert Shopify store setup and customization. From theme selection to full custom builds with Liquid.",
    features: [
      "Theme customization & setup",
      "Custom Liquid development",
      "App integrations",
      "Shopify Plus expertise",
      "Store migrations",
      "Performance optimization",
    ],
  },
  {
    id: "custom",
    icon: Code2,
    title: "Custom Ecommerce",
    description:
      "Fully custom ecommerce solutions built with modern technologies. Perfect for unique requirements.",
    features: [
      "React & Next.js development",
      "Headless commerce (Shopify, Sanity)",
      "Custom checkout flows",
      "API integrations",
      "Scalable architecture",
      "Progressive Web Apps",
    ],
  },
  {
    id: "design",
    icon: Palette,
    title: "UI/UX Design",
    description:
      "Conversion-focused design that looks beautiful and drives sales. Every pixel with purpose.",
    features: [
      "Brand identity design",
      "UI/UX design",
      "Wireframing & prototyping",
      "Mobile-first design",
      "Design systems",
      "A/B testing designs",
    ],
  },
  {
    id: "strategy",
    icon: LineChart,
    title: "Ecommerce Strategy",
    description:
      "Data-driven strategies to increase conversions, average order value, and customer lifetime value.",
    features: [
      "Conversion rate optimization",
      "Analytics setup & insights",
      "Customer journey mapping",
      "Competitor analysis",
      "Growth roadmapping",
      "Tech stack consulting",
    ],
  },
  {
    id: "maintenance",
    icon: Wrench,
    title: "Maintenance & Updates",
    description:
      "Keep your store running smoothly with ongoing maintenance, updates, and improvements.",
    features: [
      "Security updates",
      "Performance monitoring",
      "Bug fixes",
      "Feature updates",
      "Backup management",
      "Uptime monitoring",
    ],
  },
  {
    id: "support",
    icon: Headphones,
    title: "Ongoing Support",
    description:
      "Dedicated support when you need it. Quick responses and reliable solutions.",
    features: [
      "Priority support tickets",
      "Slack/email support",
      "Monthly check-ins",
      "Training sessions",
      "Documentation",
      "Emergency support",
    ],
  },
];

const techStack = [
  { name: "Shopify", category: "Platform" },
  { name: "Shopify Plus", category: "Platform" },
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "Sanity", category: "CMS" },
  { name: "Contentful", category: "CMS" },
  { name: "Stripe", category: "Payments" },
  { name: "Klaviyo", category: "Marketing" },
  { name: "Vercel", category: "Hosting" },
  { name: "PostgreSQL", category: "Database" },
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
              Everything you need to{" "}
              <span className="gradient-text">sell online</span>
            </h1>
            <p className="text-lg text-text-secondary">
              From strategy to launch and beyond. We handle every aspect of your
              ecommerce presence so you can focus on your business.
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
                className="group hover:border-brand-green/50 transition-colors scroll-mt-24"
              >
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-brand-green/20 flex items-center justify-center mb-4 group-hover:bg-brand-green/30 transition-colors">
                    <service.icon className="h-6 w-6 text-brand-green" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">{service.title}</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-text-secondary"
                      >
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

      {/* Tech Stack Section */}
      <section className="section-padding bg-surface">
        <div className="container-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-4">Our Tech Stack</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              We use modern, battle-tested technologies that scale with your
              business
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {techStack.map((tech) => (
              <Badge key={tech.name} variant="secondary" className="text-sm py-2 px-4">
                {tech.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding">
        <div className="container-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-4">Our Process</h2>
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
                    "We start with a deep dive into your business, goals, target audience, and competitors. This shapes everything we build.",
                  duration: "1 week",
                },
                {
                  step: "02",
                  title: "Design & Prototyping",
                  description:
                    "Custom designs created specifically for your brand. You'll see interactive prototypes before any code is written.",
                  duration: "1-2 weeks",
                },
                {
                  step: "03",
                  title: "Development & Testing",
                  description:
                    "We build your store with clean, efficient code. Rigorous testing ensures everything works perfectly.",
                  duration: "2-3 weeks",
                },
                {
                  step: "04",
                  title: "Launch & Support",
                  description:
                    "Smooth launch with full support. We stick around to make sure everything runs perfectly.",
                  duration: "1 week",
                },
              ].map((phase, index) => (
                <div key={phase.step} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green font-medium">
                      {phase.step}
                    </div>
                    {index < 3 && (
                      <div className="w-px h-full bg-border mt-2" />
                    )}
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
                Ready to grow your ecommerce business?
              </h2>
              <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                Let&apos;s discuss how we can help you achieve your goals.
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
