import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { hasActiveSubscription } from "@/lib/subscription";
import { getProjectsByOwner, getSitesByOwner } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { SubscriptionGate } from "@/components/dashboard/subscription-gate";
import { ReportsExportForm } from "./reports-export-form";

export default async function ReportsPage() {
  const session = await getSession();
  const userId = session?.user?.id;
  let prismaUser: { id: string } | null = null;
  let canAccess = false;
  if (userId) {
    try {
      prismaUser = await getOrCreateUserByFirebaseUid(
        userId,
        session?.user?.email ?? null,
        session?.user?.name ?? null
      );
      canAccess = await hasActiveSubscription(prismaUser.id);
    } catch (error) {
      console.error("Reports subscription check failed:", error);
      canAccess = false;
    }
  }
  if (!canAccess) {
    return <SubscriptionGate title="Reports" />;
  }

  let projects: Awaited<ReturnType<typeof getProjectsByOwner>> = [];
  let sites: Awaited<ReturnType<typeof getSitesByOwner>> = [];

  if (userId) {
    try {
      [projects, sites] = await Promise.all([
        getProjectsByOwner(userId),
        getSitesByOwner(userId),
      ]);
    } catch (e) {
      console.error("Reports data error:", e);
    }
  }

  const connectedProjects = projects.filter((p) => p.websiteUrl);
  const sources = [
    ...connectedProjects.map((p) => ({ value: `project:${p.id}`, label: p.name, type: "project" })),
    ...sites.map((s) => ({ value: `site:${s.id}`, label: s.domain, type: "site" })),
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-medium tracking-tight">Reports</h1>
        <p className="text-text-secondary text-sm mt-1">
          Export analytics data as CSV for your records or sharing.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Analytics export
          </CardTitle>
          <CardDescription>
            Select a site or project and date range to download page views and top pages as CSV.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsExportForm sources={sources} />
        </CardContent>
      </Card>

      {sources.length === 0 && (
        <Card className="border-border border-dashed">
          <CardContent className="py-8 text-center text-text-muted text-sm">
            No sites or connected projects yet. Add a site in{" "}
            <a href="/dashboard/web2/analytics" className="text-brand-green hover:underline">
              Sites & Analytics
            </a>{" "}
            to export reports.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
