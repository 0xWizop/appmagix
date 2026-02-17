import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { FileText, DollarSign, Clock, CheckCircle, Plus } from "lucide-react";

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  PAID: "success",
  CANCELLED: "error",
};

export default async function AdminInvoicesPage() {
  let invoices: any[] = [];
  let stats = {
    total: 0,
    paid: 0,
    pending: 0,
  };
  
  try {
    invoices = await db.invoice.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
        project: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    stats.total = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    stats.paid = invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + inv.amount, 0);
    stats.pending = invoices
      .filter((inv) => inv.status === "PENDING")
      .reduce((sum, inv) => sum + inv.amount, 0);
  } catch (error) {
    console.error("Error fetching invoices:", error);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Invoices</h1>
          <p className="text-text-secondary mt-1">
            Manage client invoices and payments
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/web2/admin/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-brand-green" />
              <div>
                <p className="text-2xl font-medium">
                  {formatCurrency(stats.total / 100)}
                </p>
                <p className="text-sm text-text-muted">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-medium">
                  {formatCurrency(stats.paid / 100)}
                </p>
                <p className="text-sm text-text-muted">Collected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-medium">
                  {formatCurrency(stats.pending / 100)}
                </p>
                <p className="text-sm text-text-muted">Outstanding</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      {invoices.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-text-secondary">
                      Invoice
                    </th>
                    <th className="text-left p-4 font-medium text-text-secondary">
                      Client
                    </th>
                    <th className="text-left p-4 font-medium text-text-secondary">
                      Project
                    </th>
                    <th className="text-right p-4 font-medium text-text-secondary">
                      Amount
                    </th>
                    <th className="text-center p-4 font-medium text-text-secondary">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-text-secondary">
                      Due Date
                    </th>
                    <th className="text-right p-4 font-medium text-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-border last:border-0">
                      <td className="p-4 font-medium">{invoice.invoiceNumber}</td>
                      <td className="p-4 text-text-secondary">
                        {invoice.user.name || invoice.user.email}
                      </td>
                      <td className="p-4 text-text-secondary">
                        {invoice.project?.name || "-"}
                      </td>
                      <td className="p-4 text-right font-medium">
                        {formatCurrency(invoice.amount / 100)}
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={statusColors[invoice.status]}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-text-secondary">
                        {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/web2/admin/invoices/${invoice.id}`}>
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
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
            <p className="text-text-secondary mb-6">
              Create your first invoice to get started.
            </p>
            <Button asChild>
              <Link href="/dashboard/web2/admin/invoices/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
