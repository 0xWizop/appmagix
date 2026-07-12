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
    createProject: "Request a new build via the intake form. We'll review and set up a project with milestones.",
    projectStatus: "Discovery → Design → Development → Review → Launched. We update the status as we progress.",
    milestones: "Milestones are added by our team as the project moves forward. Request changes via support.",
  },
  analytics: {
    connectSite: "Add your site URL and install the snippet we provide. Once verified, traffic will appear here.",
    sourceSelector: "Switch between connected sites to view analytics per property.",
  },
  billing: {
    invoices: "Invoices are created for your projects. Pay online or request a different method via support.",
  },
  support: {
    newTicket: "Describe your request and optionally attach it to a project. We'll respond in thread.",
    ticketStatus: "Open = in progress, Waiting = awaiting your reply, Resolved = closed.",
  },
  intake: {
    startProject: "Fill out the form to request a new build or change. We'll review and create a project.",
  },
} as const;

export const PAGE_TIPS: Record<string, { tips: PageTip[]; workflow?: WorkflowStep[] }> = {
  "/dashboard/web2/projects": {
    tips: [
      { title: "Request a build", body: "Use the intake form to request a new project or change.", cta: { label: "Request work", href: "/dashboard/web2/intake" } },
      { title: "View progress", body: "Open any project to see status, milestones, and progress." },
    ],
    workflow: [
      { label: "Submit intake", href: "/dashboard/web2/intake" },
      { label: "We set up milestones", description: "We add phases as we go" },
      { label: "Track progress", description: "On the project page" },
    ],
  },
  "/dashboard/web2/analytics": {
    tips: [
      { title: "Connect a site", body: "Add your site URL and install our snippet to enable analytics.", cta: { label: "Go to Projects", href: "/dashboard/web2/projects" } },
      { title: "Pick a source", body: "Use the source dropdown to switch between connected sites." },
    ],
  },
  "/dashboard/web2/billing": {
    tips: [
      { title: "View invoices", body: "See all invoices and their status. Pay online when due." },
    ],
  },
  "/dashboard/web2/support": {
    tips: [
      { title: "Open a ticket", body: "Describe your request; attach it to a project for context.", cta: { label: "New ticket", href: "/dashboard/web2/support/new" } },
      { title: "Reply in thread", body: "We'll respond here and notify you." },
    ],
  },
  "/dashboard/web2/intake": {
    tips: [
      { title: "Request a new build", body: "Complete the form. We'll review and set up a project with milestones." },
    ],
  },
};

export function getPageTips(pathname: string): { tips: PageTip[]; workflow?: WorkflowStep[] } | null {
  const exact = PAGE_TIPS[pathname];
  if (exact) return exact;
  if (pathname.startsWith("/dashboard/web2/projects/") && pathname !== "/dashboard/web2/projects/new") {
    return {
      tips: [
        { title: "Request changes", body: "Open a support ticket linked to this project to request changes." },
        { title: "Connect your site", body: "Add your site URL to enable analytics for this project." },
      ],
    };
  }
  return null;
}
