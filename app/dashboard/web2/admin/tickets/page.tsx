import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MessageSquare, AlertCircle, Clock, CheckCircle } from "lucide-react";

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "info"> = {
  OPEN: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
};

const priorityColors: Record<string, "default" | "secondary" | "success" | "warning" | "error"> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "error",
};

export default async function AdminTicketsPage() {
  let tickets: any[] = [];
  
  try {
    tickets = await db.ticket.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
        project: {
          select: { name: true },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: [
        { status: "asc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
  }

  const openTickets = tickets.filter((t) => t.status === "OPEN");
  const inProgressTickets = tickets.filter((t) => t.status === "IN_PROGRESS");
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium">Support Tickets</h1>
        <p className="text-text-secondary mt-1">
          Manage and respond to client support requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-medium">{openTickets.length}</p>
                <p className="text-sm text-text-muted">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-medium">{inProgressTickets.length}</p>
                <p className="text-sm text-text-muted">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-medium">{resolvedTickets.length}</p>
                <p className="text-sm text-text-muted">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand-green" />
              <div>
                <p className="text-2xl font-medium">{tickets.length}</p>
                <p className="text-sm text-text-muted">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      {tickets.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Tickets</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-text-secondary">
                      Subject
                    </th>
                    <th className="text-left p-4 font-medium text-text-secondary">
                      Client
                    </th>
                    <th className="text-left p-4 font-medium text-text-secondary">
                      Project
                    </th>
                    <th className="text-center p-4 font-medium text-text-secondary">
                      Priority
                    </th>
                    <th className="text-center p-4 font-medium text-text-secondary">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-text-secondary">
                      Created
                    </th>
                    <th className="text-right p-4 font-medium text-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-border last:border-0">
                      <td className="p-4">
                        <div>
                          <div className="font-medium truncate max-w-[200px]">
                            {ticket.subject}
                          </div>
                          <div className="text-xs text-text-muted">
                            {ticket._count.messages} messages
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-text-secondary">
                        {ticket.user.name || ticket.user.email}
                      </td>
                      <td className="p-4 text-text-secondary">
                        {ticket.project?.name || "-"}
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={priorityColors[ticket.priority]}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={statusColors[ticket.status]}>
                          {ticket.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="p-4 text-text-secondary">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/web2/admin/tickets/${ticket.id}`}>
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-brand-green-dark flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tickets yet</h3>
            <p className="text-text-secondary">
              Support tickets will appear here once clients submit them.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
