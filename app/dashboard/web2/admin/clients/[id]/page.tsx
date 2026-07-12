import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowLeft, FolderKanban, MessageSquare, CreditCard, ExternalLink } from "lucide-react";

const ADMIN_EMAIL = "merchantmagix@gmail.com";

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "info"> = {
  DISCOVERY: "info", DESIGN: "warning", DEVELOPMENT: "default", REVIEW: "warning", LAUNCHED: "success",
};

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user?.id) notFound();

  const user = await getOrCreateUserByFirebaseUid(session.user.id, session.user.email, session.user.name);
  const isAdmin = user.role === "ADMIN" || session.user.email === ADMIN_EMAIL;
  if (!isAdmin) notFound();

  const client = await db.user.findUnique({
    where: { id },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: { milestones: { select: { status: true } } },
      },
      tickets: {
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: { project: { select: { name: true } } },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { project: { select: { name: true } } },
      },
    },
  }).catch(() => null);

  if (!client) notFound();

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    if (email) return email[0].toUpperCase();
    return "U";
  };

  const getProgress = (milestones: { status: string }[]) => {
    if (!milestones.length) return 0;
    return Math.round((milestones.filter((m) => m.status === "COMPLETED").length / milestones.length) * 100);
  };

  const pendingInvoiceTotal = client.invoices
    .filter((i) => i.status === "PENDING")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      <Button variant="ghost" asChild className="-ml-2">
        <Link href="/dashboard/web2/admin/clients">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Link>
      </Button>

      {/* Client header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="bg-brand-green/20 text-brand-green text-lg">
            {getInitials(client.name, client.email)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-medium">{client.name ?? "No name"}</h1>
          <p className="text-text-secondary">{client.email}</p>
          <p className="text-xs text-text-muted mt-1">Joined {formatDate(client.createdAt)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-6 flex items-center gap-3">
          <FolderKanban className="h-5 w-5 text-brand-green" />
          <div><p className="text-2xl font-medium">{client.projects.length}</p><p className="text-sm text-text-muted">Projects</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-brand-green" />
          <div><p className="text-2xl font-medium">{client.tickets.filter(t => t.status !== "RESOLVED").length}</p><p className="text-sm text-text-muted">Open Tickets</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-amber-400" />
          <div><p className="text-2xl font-medium">{formatCurrency(pendingInvoiceTotal / 100)}</p><p className="text-sm text-text-muted">Pending</p></div>
        </CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.projects.length > 0 ? client.projects.map((project) => {
              const progress = getProgress(project.milestones);
              return (
                <Link key={project.id} href={`/dashboard/web2/projects/${project.id}`}
                  className="block p-3 rounded-lg border border-border hover:border-brand-green transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{project.name}</span>
                    <Badge variant={statusColors[project.status]} className="text-[10px]">{project.status}</Badge>
                  </div>
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-brand-green rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-[10px] text-text-muted mt-1 block">{progress}% complete</span>
                </Link>
              );
            }) : <p className="text-sm text-text-muted text-center py-4">No projects yet</p>}
          </CardContent>
        </Card>

        {/* Recent tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {client.tickets.length > 0 ? client.tickets.slice(0, 5).map((ticket) => (
              <Link key={ticket.id} href={`/dashboard/web2/admin/tickets/${ticket.id}`}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:border-brand-green transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{ticket.subject}</p>
                  {ticket.project && <p className="text-xs text-text-muted">{ticket.project.name}</p>}
                </div>
                <Badge variant={ticket.status === "RESOLVED" ? "outline" : "secondary"} className="text-[10px] shrink-0 ml-2">
                  {ticket.status.replace("_", " ")}
                </Badge>
              </Link>
            )) : <p className="text-sm text-text-muted text-center py-4">No tickets</p>}
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Invoices</CardTitle>
            <Link href="/dashboard/web2/admin/invoices" className="text-xs text-brand-green hover:underline">
              Manage all
            </Link>
          </CardHeader>
          <CardContent>
            {client.invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 font-medium text-text-secondary">Invoice</th>
                      <th className="text-left p-2 font-medium text-text-secondary">Project</th>
                      <th className="text-right p-2 font-medium text-text-secondary">Amount</th>
                      <th className="text-center p-2 font-medium text-text-secondary">Status</th>
                      <th className="text-left p-2 font-medium text-text-secondary">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-border last:border-0">
                        <td className="p-2 font-medium">{inv.invoiceNumber}</td>
                        <td className="p-2 text-text-secondary">{inv.project?.name ?? "—"}</td>
                        <td className="p-2 text-right">{formatCurrency(inv.amount / 100)}</td>
                        <td className="p-2 text-center">
                          <Badge variant={inv.status === "PAID" ? "success" : inv.status === "PENDING" ? "warning" : "secondary"}>
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-text-secondary">{formatDate(inv.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-text-muted text-center py-4">No invoices</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
