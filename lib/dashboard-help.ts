/**
 * Central help content for dashboard: tooltips, page tips, and suggested workflows.
 * Use with HelpTooltip and PageTips components.
 */

export type PageTip = {
  title: string;
  body: string;
  cta?: { label: string; href: string };
};

export type WorkflowStep = {
  label: string;
  href?: string;
  description?: string;
};

export const DASHBOARD_HELP = {
  projects: {
    createProject: "Create a project to track builds (e.g. Shopify or custom). You'll get milestones and a dedicated support thread.",
    projectStatus: "Discovery → Design → Development → Review → Launched. We'll update status as we progress.",
    milestones: "Milestones are added by our team as the project moves forward. You can request changes via support.",
  },
  analytics: {
    connectSite: "Add your site URL and install the snippet we provide. Once verified, traffic and events will appear here.",
    sourceSelector: "Switch between connected sites to view analytics per property.",
  },
  crm: {
    addContact: "Add contacts to track leads and customers. Link them to projects or invoices later.",
    contactTypes: "Use labels to segment contacts (e.g. Lead, Customer, Partner).",
  },
  billing: {
    invoices: "Invoices are created for your projects. Pay online or request a different method via support.",
    createInvoice: "Create an invoice for a client. Link to a project and set line items and due date.",
  },
  support: {
    newTicket: "Describe your request and optionally attach it to a project. We'll respond and you can reply in thread.",
    ticketStatus: "Open = in progress, Waiting = awaiting your reply, Resolved = closed.",
  },
  tools: {
    domainLookup: "Enter any domain to see DNS, SSL, and basic info. No account or project required.",
  },
  fileConvert: {
    description: "All conversion runs in your browser. Files are not uploaded to our servers.",
  },
  intake: {
    startProject: "Fill out the intake form to request a new build. We'll review and create a project with milestones.",
  },
  apiBuilder: {
    description: "Build and test API requests. Save and reuse requests for your integrations.",
  },
} as const;

/** Short tips to show in a "What you can do here" or workflow strip on a page */
export const PAGE_TIPS: Record<string, { tips: PageTip[]; workflow?: WorkflowStep[] }> = {
  "/dashboard/web2/projects": {
    tips: [
      { title: "Create a project", body: "Start by creating a project so we can track your build and milestones.", cta: { label: "Create project", href: "/dashboard/web2/projects/new" } },
      { title: "View progress", body: "Open any project to see status, milestones, and progress." },
    ],
    workflow: [
      { label: "Create project", href: "/dashboard/web2/projects/new" },
      { label: "Connect your site", description: "On the project page" },
      { label: "Track milestones", description: "We add phases as we go" },
    ],
  },
  "/dashboard/web2/analytics": {
    tips: [
      { title: "Connect a site", body: "Add your site URL on a project page and install our verification snippet to enable analytics.", cta: { label: "Go to Projects", href: "/dashboard/web2/projects" } },
      { title: "Pick a source", body: "Use the source dropdown to switch between connected sites." },
    ],
  },
  "/dashboard/web2/crm": {
    tips: [
      { title: "Add contacts", body: "Add leads and customers here. You can link them to projects and invoices later." },
      { title: "Filter and search", body: "Use the table to filter by label or search by name or email." },
    ],
  },
  "/dashboard/web2/billing": {
    tips: [
      { title: "View invoices", body: "See all invoices and their status. Pay online when due." },
      { title: "Need a copy?", body: "Open an invoice to view or download details." },
    ],
  },
  "/dashboard/web2/support": {
    tips: [
      { title: "Open a ticket", body: "Describe your request; you can attach it to a project for context.", cta: { label: "New ticket", href: "/dashboard/web2/support/new" } },
      { title: "Reply in thread", body: "We'll respond here. Check back or we'll notify you." },
    ],
  },
  "/dashboard/web2/tools": {
    tips: [
      { title: "Domain lookup", body: "Enter any domain for DNS, SSL, and basic info. No project required." },
    ],
  },
  "/dashboard/web2/intake": {
    tips: [
      { title: "Request a new build", body: "Complete the intake form. We'll review and set up a project with milestones." },
    ],
  },
};

export function getPageTips(pathname: string): { tips: PageTip[]; workflow?: WorkflowStep[] } | null {
  const exact = PAGE_TIPS[pathname];
  if (exact) return exact;
  if (pathname.startsWith("/dashboard/web2/projects/") && pathname !== "/dashboard/web2/projects/new") {
    return {
      tips: [
        { title: "Request changes", body: "Use “Request Change” to open a support ticket linked to this project." },
        { title: "Connect your site", body: "Add your site URL in the sidebar card to enable analytics for this project." },
      ],
    };
  }
  return null;
}
