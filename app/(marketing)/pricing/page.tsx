import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageSquare } from "lucide-react";
import { CheckoutButton } from "@/components/checkout-button";
import { PricingCalculator } from "@/components/pricing/pricing-calculator";
import { PricingToggle } from "@/components/pricing/pricing-toggle";

const addOns = [
  { name: "Additional revision round", price: "$149", productKey: "additional_revision_round" as const },
  { name: "Extended support (per month)", price: "$199/month", productKey: "extended_support" as const },
];

const faqs = [
  {
    question: "How long does a typical project take?",
    answer:
      "Custom websites typically take 3–4 weeks from kickoff to launch. Web apps and SaaS products take 6–10 weeks depending on feature scope. E-commerce builds are usually 2–3 weeks. We'll give you a precise timeline during our initial consultation.",
  },
  {
    question: "What do I need to provide to get started?",
    answer:
      "We'll need your brand guidelines (logo, colors, fonts), content or copy for your pages, and a clear picture of what you want to achieve. Don't worry if you don't have everything — we can help with brand direction, copywriting, and content strategy.",
  },
  {
    question: "Do you offer payment plans?",
    answer:
      "Yes! We typically split payments into milestones: deposit to start, mid-project payment, and final payment before launch. We can discuss what works best for your situation.",
  },
  {
    question: "What if I need changes after launch?",
    answer:
      "All packages include at least 30 days of post-launch support. After that, we offer monthly retainer packages or a pay-as-you-go model for ongoing changes and maintenance.",
  },
  {
    question: "Do you help with hosting and domains?",
    answer:
      "Absolutely. For custom websites and web apps we recommend Vercel, Railway, or Fly.io — many are free or very affordable. For e-commerce we'll help you choose and set up the right platform. We handle domain setup and DNS too.",
  },
  {
    question: "Can you build a mobile app too?",
    answer:
      "Yes — we build cross-platform mobile apps using React Native, sharing code with your web app for maximum efficiency. Select 'Mobile App' in our custom quote calculator to see pricing.",
  },
  {
    question: "Which e-commerce platforms do you work with?",
    answer:
      "We're platform-agnostic. We work with Shopify, Next.js Commerce (headless), WooCommerce, and fully custom storefronts. We'll recommend the right fit based on your product catalogue, budget, and long-term goals.",
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
          <div className="text-center max-w-3xl mx-auto mb-12">
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

          {/* Interactive Pricing Toggle + Cards */}
          <PricingToggle />
        </div>
      </section>

      {/* Interactive Calculator Section */}
      <section className="section-padding bg-background border-y border-border">
        <div className="container-width">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Custom Quote</Badge>
            <h2 className="text-3xl sm:text-4xl font-medium mb-4">
              Need something specific?
            </h2>
            <p className="text-text-secondary">
              Use our interactive calculator to build your perfect package and get an 
              instant estimated quote for your project.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <PricingCalculator />
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

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {addOns.map((addon) => (
              <Card key={addon.name} className="shadow-none border-border">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-sm font-medium">{addon.name}</span>
                    <span className="ml-2 font-medium text-brand-green">{addon.price}</span>
                  </div>
                  <CheckoutButton productKey={addon.productKey} size="sm" className="shrink-0">
                    Add to checkout
                  </CheckoutButton>
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
