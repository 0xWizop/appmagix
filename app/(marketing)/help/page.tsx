import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, MessageSquare, FolderKanban, CreditCard } from "lucide-react";

const categories = [
  {
    title: "Getting Started",
    description: "Create your account and get set up",
    icon: BookOpen,
    href: "/help/getting-started",
  },
  {
    title: "Projects",
    description: "Track your website and app builds",
    icon: FolderKanban,
    href: "/help/projects",
  },
  {
    title: "Support Tickets",
    description: "Request changes and get help",
    icon: MessageSquare,
    href: "/help/support",
  },
  {
    title: "Billing",
    description: "Invoices and payments",
    icon: CreditCard,
    href: "/help/billing",
  },
];

const faqs = [
  {
    q: "How do I track my project progress?",
    a: "Go to Dashboard → Projects to see all your projects. Each project shows milestones and a progress bar. Click a project for detailed status, timeline, and your task list.",
  },
  {
    q: "How do I request a change or update to my site?",
    a: "Go to Dashboard → Support and click New Ticket. Describe what you need — you can attach it to a specific project. We typically respond within 24 hours.",
  },
  {
    q: "How do I connect my website for analytics?",
    a: "Go to Sites & Analytics in your dashboard sidebar. Add your site domain and copy the embed snippet. Paste it into your site's <head> tag and we'll verify it automatically.",
  },
  {
    q: "How does billing work?",
    a: "Invoices are created by our team as work progresses. You'll see them in Dashboard → Billing. Pending invoices have a Pay Now button — payments are processed securely via Stripe.",
  },
  {
    q: "Can I download my invoices?",
    a: "Yes — open any invoice in Dashboard → Billing and click the download icon to get a PDF receipt.",
  },
  {
    q: "What if I need urgent help?",
    a: "Open a support ticket and set the priority to High. You can also email us directly at hello@webmint.io.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen">
      <section className="section-padding pt-24">
        <div className="container-width">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-5xl font-medium mb-4">Help & Knowledge Base</h1>
            <p className="text-lg text-text-secondary">
              Find answers and learn how to get the most from your dashboard.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {categories.map((cat) => (
              <Link key={cat.href} href={cat.href}>
                <Card className="h-full hover:border-brand-green/50 transition-colors">
                  <CardHeader>
                    <cat.icon className="h-8 w-8 text-brand-green mb-2" />
                    <CardTitle className="text-lg">{cat.title}</CardTitle>
                    <CardDescription>{cat.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-medium mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="text-center mt-16">
            <p className="text-text-secondary mb-4">Still need help?</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-brand-green hover:underline"
            >
              Contact us
              <MessageSquare className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
