import Link from "next/link";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { getTicketsByPrismaUserId } from "@/lib/db-tickets";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Plus, Clock, AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageTips } from "@/components/dashboard/page-tips";

const statusColors: Record<string, "default" | "secondary" | "outline"> = {
  OPEN: "default",
  IN_PROGRESS: "secondary",
  RESOLVED: "outline",
};

const priorityColors: Record<string, "default" | "secondary" | "outline"> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "default",
};

export default async function SupportPage() {
  const session = await getSession();
  let tickets: Awaited<ReturnType<typeof getTicketsByPrismaUserId>> = [];

  try {
    if (session?.user?.id) {
      const user = await getOrCreateUserByFirebaseUid(
        session.user.id,
        session.user.email,
        session.user.name
      );
      tickets = await getTicketsByPrismaUserId(user.id);
    }
  } catch (error) {
    console.error("Error fetching tickets:", error);
  }

  const openTickets = tickets.filter((t) => t.status !== "RESOLVED");
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/help" className="text-sm text-brand-green hover:underline">
          Help & FAQ →
        </Link>
        <Button asChild>
          <Link href="/dashboard/web2/support/new">
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Link>
        </Button>
      </div>
      <PageTips />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-medium tabular-nums">{openTickets.length}</p>
                <p className="text-sm text-text-muted">Open</p>
              </div>
              <AlertCircle className="h-5 w-5 text-text-muted" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-medium tabular-nums">
                  {tickets.filter((t) => t.status === "IN_PROGRESS").length}
                </p>
                <p className="text-sm text-text-muted">In Progress</p>
              </div>
              <Clock className="h-5 w-5 text-text-muted" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-medium tabular-nums">{resolvedTickets.length}</p>
                <p className="text-sm text-text-muted">Resolved</p>
              </div>
              <MessageSquare className="h-5 w-5 text-text-muted" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      {tickets.length > 0 ? (
        <div className="space-y-6">
          {/* Open Tickets */}
          {openTickets.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-4">Open Tickets</h2>
              <div className="space-y-3">
                {openTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/dashboard/web2/support/${ticket.id}`}
                    className="block"
                  >
                    <Card className="hover:border-border transition-colors border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">
                                {ticket.subject}
                              </h3>
                              <Badge variant={priorityColors[ticket.priority]}>
                                {ticket.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-text-secondary line-clamp-1">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                              {ticket.project && (
                                <span>Project: {ticket.project.name}</span>
                              )}
                              <span>{ticket.messageCount ?? 0} messages</span>
                              <span>{formatDate(ticket.createdAt)}</span>
                            </div>
                          </div>
                          <Badge variant={statusColors[ticket.status]}>
                            {ticket.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Resolved Tickets */}
          {resolvedTickets.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-4">Resolved Tickets</h2>
              <div className="space-y-3">
                {resolvedTickets.slice(0, 5).map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/dashboard/web2/support/${ticket.id}`}
                    className="block"
                  >
                    <Card className="hover:border-border transition-colors opacity-80 border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {ticket.subject}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                              {ticket.project && (
                                <span>Project: {ticket.project.name}</span>
                              )}
                              <span>Resolved {formatDate(ticket.updatedAt)}</span>
                            </div>
                          </div>
                          <Badge variant="outline">Resolved</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No tickets"
          description="Create a support ticket to get help. We typically respond within 24 hours."
          actionLabel="Create Ticket"
          actionHref="/dashboard/web2/support/new"
        />
      )}
    </div>
  );
}
