import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { getTicketWithMessagesByPrismaUserId } from "@/lib/db-tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { TicketReplyForm } from "./reply-form";

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

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.user?.id) {
    notFound();
  }

  let ticket: Awaited<ReturnType<typeof getTicketWithMessagesByPrismaUserId>> = null;
  try {
    const user = await getOrCreateUserByFirebaseUid(
      session.user.id,
      session.user.email,
      session.user.name
    );
    ticket = await getTicketWithMessagesByPrismaUserId(id, user.id);
  } catch (error) {
    console.error("Error fetching ticket:", error);
  }

  if (!ticket) {
    notFound();
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Button variant="ghost" asChild className="mb-6 -ml-2">
        <Link href="/dashboard/web2/support">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Support
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium tracking-tight mb-2">{ticket.subject}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
            <Badge variant={statusColors[ticket.status]}>
              {ticket.status.replace("_", " ")}
            </Badge>
            <Badge variant={priorityColors[ticket.priority]}>
              {ticket.priority} Priority
            </Badge>
            {ticket.project && (
              <span>Project: {ticket.project.name}</span>
            )}
            <span>{formatDate(ticket.createdAt)}</span>
          </div>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={session.user.image ?? undefined} />
              <AvatarFallback className="bg-surface-hover text-text-secondary">
                {getInitials(session.user.name ?? session.user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{session.user.name ?? session.user.email ?? "You"}</div>
              <div className="text-xs text-text-muted">
                {formatDate(ticket.createdAt)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{ticket.description}</p>
        </CardContent>
      </Card>

      {/* Messages Thread */}
      {ticket.messages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Replies</h2>
          {ticket.messages.map((message) => {
            const isAdmin = message.sender?.role === "ADMIN";
            return (
              <Card
                key={message.id}
                className={isAdmin ? "border-border" : "border-border"}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={message.sender?.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-surface-hover text-text-secondary">
                        {getInitials(message.sender?.name ?? message.sender?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{message.sender?.name ?? message.sender?.email ?? "User"}</span>
                        {isAdmin && (
                          <Badge variant="secondary" className="text-xs">
                            Support
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-text-muted">
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{message.content ?? ""}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reply Form */}
      {ticket.status !== "RESOLVED" && (
        <>
          <Separator />
          <TicketReplyForm ticketId={ticket.id} />
        </>
      )}

        {ticket.status === "RESOLVED" && (
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-text-secondary">
              This ticket has been resolved. Create a new ticket for further assistance.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
