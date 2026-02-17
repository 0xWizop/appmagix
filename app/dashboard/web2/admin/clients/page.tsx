import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Users, FolderKanban, Mail, Calendar } from "lucide-react";

export default async function AdminClientsPage() {
  let clients: any[] = [];
  
  try {
    clients = await db.user.findMany({
      where: { role: "CLIENT" },
      include: {
        _count: {
          select: {
            projects: true,
            tickets: true,
            invoices: true,
          },
        },
        projects: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Clients</h1>
          <p className="text-text-secondary mt-1">
            Manage your client accounts and projects
          </p>
        </div>
        <Badge variant="secondary">{clients.length} clients</Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-green" />
              <div>
                <p className="text-2xl font-medium">{clients.length}</p>
                <p className="text-sm text-text-muted">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-medium">
                  {clients.reduce((sum, c) => sum + c._count.projects, 0)}
                </p>
                <p className="text-sm text-text-muted">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      {clients.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-text-secondary">
                      Client
                    </th>
                    <th className="text-left p-4 font-medium text-text-secondary">
                      Email
                    </th>
                    <th className="text-center p-4 font-medium text-text-secondary">
                      Projects
                    </th>
                    <th className="text-center p-4 font-medium text-text-secondary">
                      Tickets
                    </th>
                    <th className="text-left p-4 font-medium text-text-secondary">
                      Joined
                    </th>
                    <th className="text-right p-4 font-medium text-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-border last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={client.avatarUrl || undefined} />
                            <AvatarFallback className="bg-brand-green-dark text-white">
                              {getInitials(client.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{client.name || "No name"}</div>
                            {client.projects[0] && (
                              <div className="text-xs text-text-muted">
                                Latest: {client.projects[0].name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-text-secondary">{client.email}</td>
                      <td className="p-4 text-center">
                        <Badge variant="secondary">{client._count.projects}</Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant="secondary">{client._count.tickets}</Badge>
                      </td>
                      <td className="p-4 text-text-secondary">
                        {formatDate(client.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/web2/admin/clients/${client.id}`}>
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
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2">No clients yet</h3>
            <p className="text-text-secondary">
              Clients will appear here once they register.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
