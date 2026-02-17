import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, ShoppingBag, Code2, ArrowRight, MessageSquare } from "lucide-react";

const shopifyFeatures = [
  "Premium Shopify theme",
  "Full theme customization",
  "Brand colors & typography",
  "Homepage design",
  "Product page optimization",
  "Collection pages setup",
  "Mobile responsive design",
  "Essential app integrations",
  "Payment gateway setup",
  "Shipping configuration",
  "Basic SEO setup",
  "1 round of revisions",
  "30 days post-launch support",
];

const customFeatures = [
  "100% custom design",
  "Unlimited pages",
  "Custom React/Next.js build",
  "Headless CMS integration",
  "Custom checkout flows",
  "Advanced animations",
  "Performance optimization",
  "Custom integrations",
  "API development",
  "Admin dashboard",
  "Advanced SEO setup",
  "3 rounds of revisions",
  "90 days post-launch support",
];

const addOns = [
  { name: "Email marketing setup (Klaviyo)", price: "$149" },
  { name: "Product photography guidelines", price: "$99" },
  { name: "Copywriting (per page)", price: "$75" },
  { name: "Additional revision rounds", price: "$149/round" },
  { name: "Extended support (per month)", price: "$199/month" },
  { name: "Analytics & reporting setup", price: "$149" },
];

const faqs = [
  {
    question: "How long does a typical project take?",
    answer:
      "Shopify builds typically take 2-3 weeks from kickoff to launch. Custom builds take 4-6 weeks depending on complexity. We'll give you a precise timeline during our initial consultation.",
  },
  {
    question: "What do I need to provide to get started?",
    answer:
      "We'll need your brand guidelines (logo, colors, fonts), product information and images, and any specific features or integrations you want. Don't worry if you don't have everything ready - we can help guide you through it.",
  },
  {
    question: "Do you offer payment plans?",
    answer:
      "Yes! We typically split payments into 2-3 milestones: deposit to start, mid-project payment, and final payment before launch. We can discuss what works best for your situation.",
  },
  {
    question: "What if I need changes after launch?",
    answer:
      "All packages include post-launch support (30 days for Shopify, 90 days for Custom). After that, we offer monthly retainer packages or hourly rates for ongoing changes and maintenance.",
  },
  {
    question: "Do you help with hosting and domains?",
    answer:
      "For Shopify builds, hosting is included in your Shopify subscription. For custom builds, we recommend and help set up hosting on Vercel (often free for most sites). We can also help with domain setup.",
  },
  {
    question: "Can you migrate my existing store?",
    answer:
      "Absolutely. We handle full migrations including products, customers, orders history, and SEO redirects. Migration is included in the project scope.",
  },
  {
    question: "What's the difference between Shopify and Custom builds?",
    answer:
      "Shopify is great for most businesses - it's fast to launch, easy to manage, and handles payments/shipping out of the box. Custom builds are for businesses with unique needs that Shopify can't handle, or those who want complete control over their tech stack.",
  },
  {
    question: "Do you offer ongoing maintenance?",
    answer:
      "Yes, we offer monthly maintenance packages starting at $199/month that include updates, security patches, performance monitoring, and a set number of change requests.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section-padding pt-24">
        <div className="container-width">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4">Transparent Pricing</Badge>
            <h1 className="text-4xl sm:text-5xl font-medium mb-6">
              Simple pricing,{" "}
              <span className="gradient-text">no surprises</span>
            </h1>
            <p className="text-lg text-text-secondary">
              Choose the right solution for your business. All prices include
              design, development, and launch support.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Shopify Plan */}
            <Card className="relative shadow-none">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-brand-green/20 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-6 w-6 text-brand-green" />
                </div>
                <CardTitle className="text-2xl">Shopify Build</CardTitle>
                <CardDescription>
                  Perfect for businesses ready to launch quickly with a proven platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-medium">$799</span>
                    <span className="text-text-muted">starting at</span>
                  </div>
                  <p className="text-sm text-text-muted mt-1">
                    + Shopify subscription ($29-$299/mo)
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {shopifyFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button className="w-full" size="lg" asChild>
                  <Link href="/contact?plan=shopify">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Custom Plan */}
            <Card className="relative border-brand-green/50 shadow-none">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge>Most Popular</Badge>
              </div>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-brand-green/20 flex items-center justify-center mb-4">
                  <Code2 className="h-6 w-6 text-brand-green" />
                </div>
                <CardTitle className="text-2xl">Custom Build</CardTitle>
                <CardDescription>
                  For businesses that need complete flexibility and unique features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-medium">$2,499</span>
                    <span className="text-text-muted">starting at</span>
                  </div>
                  <p className="text-sm text-text-muted mt-1">
                    Hosting from $0-20/mo (Vercel)
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {customFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button className="w-full" size="lg" asChild>
                  <Link href="/contact?plan=custom">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="section-padding bg-surface">
        <div className="container-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-4">Optional Add-ons</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Enhance your project with these additional services
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {addOns.map((addon) => (
              <Card key={addon.name} className="shadow-none">
                <CardContent className="p-4 flex justify-between items-center">
                  <span className="text-sm">{addon.name}</span>
                  <span className="font-medium text-brand-green">
                    {addon.price}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding">
        <div className="container-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Everything you need to know about working with us
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-surface">
        <div className="container-width">
          <Card className="bg-gradient-to-br from-brand-green/10 via-transparent to-transparent border-brand-green/20 shadow-none">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-medium mb-4">
                Not sure which plan is right for you?
              </h2>
              <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                Book a free consultation and we&apos;ll help you figure out the best
                approach for your business and budget.
              </p>
              <Button size="xl" asChild>
                <Link href="/contact">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Book a Free Call
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
