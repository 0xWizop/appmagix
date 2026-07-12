import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { getTicketWithMessagesAdmin } from "@/lib/db-tickets";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, User } from "lucide-react";
import { AdminTicketActions } from "./ticket-actions";
import { TicketReplyForm } from "@/app/dashboard/web2/support/[id]/reply-form";

const ADMIN_EMAIL = "merchantmagix@gmail.com";

const statusColors: Record<string, "default" | "secondary" | "outline" | "success" | "warning"> = {
  OPEN: "warning",
  IN_PROGRESS: "secondary",
  RESOLVED: "success",
};

const priorityColors: Record<string, "default" | "secondary" | "error"> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "error",
};

export default async function AdminTicketDetailPage({
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

  const ticket = await getTicketWithMessagesAdmin(id).catch(() => null);
  if (!ticket) notFound();

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    if (email) return email[0].toUpperCase();
    return "U";
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <Button variant="ghost" asChild className="-ml-2">
        <Link href="/dashboard/web2/admin/tickets">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-xl font-medium">{ticket.subject}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <Badge variant={statusColors[ticket.status]}>{ticket.status.replace("_", " ")}</Badge>
            <Badge variant={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
            {ticket.project && <span>Project: {ticket.project.name}</span>}
            <span>{formatDate(ticket.createdAt)}</span>
          </div>
          {ticket.user && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <User className="h-4 w-4" />
              <span>Client: {ticket.user.name ?? ticket.user.email}</span>
            </div>
          )}
        </div>
        {/* Admin status controls */}
        <AdminTicketActions ticketId={ticket.id} currentStatus={ticket.status} currentPriority={ticket.priority} />
      </div>

      {/* Original message */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-surface-hover text-xs">
                {getInitials(ticket.user?.name, ticket.user?.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{ticket.user?.name ?? ticket.user?.email ?? "Client"}</div>
              <div className="text-xs text-text-muted">{formatDate(ticket.createdAt)}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-text-secondary">{ticket.description}</p>
        </CardContent>
      </Card>

      {/* Message thread */}
      {ticket.messages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-medium">Thread</h2>
          {ticket.messages.map((message) => {
            const isAdminMessage = message.sender?.role === "ADMIN";
            return (
              <Card key={message.id} className={isAdminMessage ? "border-brand-green/20 bg-brand-green/5" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-surface-hover text-xs">
                        {getInitials(message.sender?.name, message.sender?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{message.sender?.name ?? message.sender?.email ?? "User"}</span>
                        {isAdminMessage && <Badge variant="secondary" className="text-xs">Webmint</Badge>}
                      </div>
                      <div className="text-xs text-text-muted">{formatDate(message.createdAt)}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reply form */}
      {ticket.status !== "RESOLVED" && (
        <>
          <Separator />
          <TicketReplyForm ticketId={ticket.id} />
        </>
      )}
    </div>
  );
}
