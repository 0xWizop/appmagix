import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const articles: Record<
  string,
  { title: string; content: { type: "paragraph" | "list"; text?: string; items?: string[] }[] }
> = {
  "getting-started": {
    title: "Getting Started",
    content: [
      {
        type: "paragraph",
        text: "Welcome to Webmint. Your dashboard is the hub for tracking your project, submitting change requests, viewing analytics, and managing invoices.",
      },
      {
        type: "paragraph",
        text: "After signing in, you'll see the main dashboard with your project status, open tickets, and pending invoices.",
      },
      {
        type: "paragraph",
        text: "Key areas:",
      },
      {
        type: "list",
        items: [
          "Projects — View and track your website or app build",
          "Request Work — Submit a new project or change request",
          "Support — Open tickets when you need a change or have a question",
          "Billing — View invoices and make payments",
          "Sites & Analytics — Connect your site and track traffic",
        ],
      },
    ],
  },
  projects: {
    title: "Projects",
    content: [
      {
        type: "paragraph",
        text: "Projects represent your active builds. Each project has a status — Discovery, Design, Development, Review, or Launched — and a set of milestones our team updates as we progress.",
      },
      {
        type: "paragraph",
        text: "Click a project to see the full timeline, milestone progress, your task list, and linked invoices.",
      },
      {
        type: "paragraph",
        text: "To request a change: use the Task list on the project page to add a change request, or click 'Request Change' to open a support ticket linked to that project.",
      },
      {
        type: "paragraph",
        text: "To connect your site for analytics: add your website URL in the project sidebar, copy the verification snippet, and paste it into your site's <head> tag. We'll verify automatically.",
      },
    ],
  },
  support: {
    title: "Support Tickets",
    content: [
      {
        type: "paragraph",
        text: "Submit a support ticket from Dashboard → Support → New Ticket. Attach it to a project if relevant, add a subject, and describe what you need.",
      },
      {
        type: "paragraph",
        text: "We respond within 24 hours. You can reply directly in the ticket thread to continue the conversation.",
      },
      {
        type: "paragraph",
        text: "Ticket statuses:",
      },
      {
        type: "list",
        items: [
          "Open — New ticket, not yet picked up",
          "In Progress — Our team is working on it",
          "Resolved — Done and closed",
        ],
      },
      {
        type: "paragraph",
        text: "For urgent issues, set the priority to High when creating the ticket.",
      },
    ],
  },
  billing: {
    title: "Billing",
    content: [
      {
        type: "paragraph",
        text: "View all invoices in Dashboard → Billing. Pending invoices show a Pay Now button — payments are processed securely via Stripe.",
      },
      {
        type: "paragraph",
        text: "Paid invoices are marked with a green badge. Click the download icon on any invoice to get a PDF receipt.",
      },
      {
        type: "paragraph",
        text: "If you have a question about an invoice, open a support ticket and we'll sort it out quickly.",
      },
    ],
  },
};

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const article = articles[slug];

  if (!article) notFound();

  return (
    <div className="min-h-screen">
      <section className="section-padding pt-24">
        <div className="container-width max-w-3xl">
          <Button variant="ghost" asChild className="mb-8">
            <Link href="/help" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Help
            </Link>
          </Button>

          <h1 className="text-3xl font-medium mb-8">{article.title}</h1>

          <div className="prose prose-invert max-w-none space-y-4">
            {article.content.map((block, i) =>
              block.type === "paragraph" ? (
                <p key={i} className="text-text-secondary leading-relaxed">
                  {block.text}
                </p>
              ) : block.type === "list" && block.items ? (
                <ul key={i} className="list-disc list-inside space-y-2 text-text-secondary">
                  {block.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              ) : null
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-text-muted text-sm mb-2">Need more help?</p>
            <Link href="/contact" className="text-brand-green hover:underline">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
