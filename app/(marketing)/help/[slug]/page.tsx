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
        text: "Welcome to MerchantMagix. Your dashboard is the hub for tracking projects, managing your team, and accessing tools.",
      },
      {
        type: "paragraph",
        text: "After signing in, you'll see the main dashboard with quick stats, recent activity, and shortcuts to common tasks.",
      },
      {
        type: "paragraph",
        text: "Key areas:",
      },
      {
        type: "list",
        items: [
          "Projects — View and track your website builds",
          "Team — Create an org and invite members",
          "Support — Submit tickets when you need help",
          "Billing — View invoices and payment history",
          "File Convert — Convert files (data, images, video)",
        ],
      },
      {
        type: "paragraph",
        text: "Use the User/Developer toggle in the sidebar to switch between a simplified view and full dev tools (Playground, API Builder).",
      },
    ],
  },
  projects: {
    title: "Projects",
    content: [
      {
        type: "paragraph",
        text: "Projects represent your website builds. Each project has a status (Discovery, Design, Development, Review, Launched) and milestones.",
      },
      {
        type: "paragraph",
        text: "Click a project to see milestones, support tickets, and invoices. You can also connect your live site for analytics.",
      },
      {
        type: "paragraph",
        text: "To connect your site: add your website URL, copy the verification token we provide, and add it to your site's HTML as a meta tag. We'll verify and start tracking page views.",
      },
    ],
  },
  team: {
    title: "Team & Organizations",
    content: [
      {
        type: "paragraph",
        text: "Create an organization to collaborate with your team. Only Owners and Admins can invite members.",
      },
      {
        type: "paragraph",
        text: "To invite: enter the email and role (Admin, Member, or Viewer), then Send Invite. Copy the invite link and share it. The recipient signs in with that email and accepts the invite.",
      },
      {
        type: "paragraph",
        text: "Roles:",
      },
      {
        type: "list",
        items: [
          "Owner — Full control, can delete org",
          "Admin — Can invite and manage members",
          "Member — Can view and use org resources",
          "Viewer — Read-only access",
        ],
      },
    ],
  },
  billing: {
    title: "Billing",
    content: [
      {
        type: "paragraph",
        text: "View invoices and payment history in Dashboard → Billing. Pending invoices require action; paid invoices are marked complete.",
      },
      {
        type: "paragraph",
        text: "Stripe integration for online payments is coming soon. Until then, invoice payments are handled offline.",
      },
    ],
  },
  support: {
    title: "Support",
    content: [
      {
        type: "paragraph",
        text: "Submit a support ticket from Dashboard → Support → New Ticket. Include the project (if relevant), subject, and description.",
      },
      {
        type: "paragraph",
        text: "We'll respond as soon as possible. You can reply to tickets to continue the conversation. Resolved tickets stay in your history for reference.",
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
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
