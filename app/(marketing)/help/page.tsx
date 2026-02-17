import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, MessageSquare, FolderKanban, Users, CreditCard } from "lucide-react";

const categories = [
  {
    title: "Getting Started",
    description: "Learn the basics of your dashboard",
    icon: BookOpen,
    href: "/help/getting-started",
  },
  {
    title: "Projects",
    description: "Track your website builds",
    icon: FolderKanban,
    href: "/help/projects",
  },
  {
    title: "Team & Organizations",
    description: "Invite members and manage roles",
    icon: Users,
    href: "/help/team",
  },
  {
    title: "Billing",
    description: "Invoices and payments",
    icon: CreditCard,
    href: "/help/billing",
  },
  {
    title: "Support",
    description: "Submit tickets and get help",
    icon: MessageSquare,
    href: "/help/support",
  },
];

const faqs = [
  {
    q: "How do I track my project progress?",
    a: "Go to Dashboard → Projects to see all your projects. Each project shows milestones and progress. Click a project for detailed status, milestones, and support tickets.",
  },
  {
    q: "How do I invite team members?",
    a: "Create an organization in Team, then use Invite Member to send an invite link by email. The recipient signs in (or creates an account) and accepts the invite to join your org.",
  },
  {
    q: "Where do I submit a support ticket?",
    a: "Go to Dashboard → Support and click New Ticket. Describe your issue and we'll respond as soon as possible.",
  },
  {
    q: "How do I connect my website for analytics?",
    a: "In your project page, use Connect Site to add your website URL. We'll give you a verification token to add to your site. Once verified, analytics will start tracking.",
  },
  {
    q: "What's the difference between User and Developer mode?",
    a: "User mode shows core tools: Dashboard, Projects, File Convert, Support, Billing. Developer mode adds Playground and API Builder for dev utilities. Toggle in the sidebar.",
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
