import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  Zap,
  FolderKanban,
} from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CreateInvoiceForm } from "./create-invoice-form";
import { PageTips } from "@/components/dashboard/page-tips";
import { BillingChart } from "./billing-chart";
import { InvoiceReminderButton } from "./invoice-reminder-button";

const statusColors: Record<string, "default" | "secondary" | "outline"> = {
  PENDING: "default",
  PAID: "outline",
  CANCELLED: "secondary",
};

export default async function BillingPage() {
  const session = await getSession();
  let invoices: { id: string; invoiceNumber: string; amount: number; status: string; description: string | null; dueDate: Date | null; paidAt: Date | null; createdAt: Date; project?: { name: string }; stripePaymentUrl?: string | null; pdfUrl?: string | null }[] = [];
  let stats = { total: 0, paid: 0, pending: 0 };
  let projectCount = 0;

  try {
    if (session?.user?.id) {
      const user = await getOrCreateUserByFirebaseUid(
        session.user.id,
        session.user.email,
        session.user.name
      );
      const [invList, count] = await Promise.all([
        db.invoice.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          include: { project: { select: { name: true } } },
        }),
        db.project.count({ where: { userId: user.id } }),
      ]);
      projectCount = count;
      invoices = invList.map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        amount: i.amount,
        status: i.status,
        description: i.description,
        dueDate: i.dueDate,
        paidAt: i.paidAt,
        createdAt: i.createdAt,
        project: i.project ? { name: i.project.name } : undefined,
        stripePaymentUrl: i.stripePaymentUrl,
        pdfUrl: i.pdfUrl,
      }));
      stats.total = invoices.reduce((sum, inv) => sum + inv.amount, 0);
      stats.paid = invoices.filter((inv) => inv.status === "PAID").reduce((sum, inv) => sum + inv.amount, 0);
      stats.pending = invoices.filter((inv) => inv.status === "PENDING").reduce((sum, inv) => sum + inv.amount, 0);
    }
  } catch (error) {
    console.error("Error fetching invoices:", error);
  }

  const pendingInvoices = invoices.filter((inv) => inv.status === "PENDING");
  const paidInvoices = invoices.filter((inv) => inv.status === "PAID");

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-0 p-6 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Billing</h1>
          <p className="text-text-secondary mt-1 text-sm">
            Invoices, payment history, and usage overview.
          </p>
        </div>
        <CreateInvoiceForm />
      </div>
      <PageTips className="mb-6" />

      <div className="grid gap-4 sm:grid-cols-3 shrink-0">
        <Card className="border-border hover:border-brand-green transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Total Invoiced
            </CardTitle>
            <CreditCard className="h-5 w-5 text-text-muted" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium tabular-nums">{formatCurrency(stats.total / 100)}</p>
          </CardContent>
        </Card>
        <Card className="border-border hover:border-brand-green transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Paid
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-text-muted" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium tabular-nums">{formatCurrency(stats.paid / 100)}</p>
          </CardContent>
        </Card>
        <Card className="border-border hover:border-brand-green transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Outstanding
            </CardTitle>
            <Clock className="h-5 w-5 text-text-muted" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium tabular-nums">{formatCurrency(stats.pending / 100)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage */}
      <Card className="border-border shrink-0 mt-4">
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>
            Account and project usage summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-surface">
              <div className="h-10 w-10 rounded-lg bg-brand-green-dark flex items-center justify-center shrink-0">
                <FolderKanban className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-medium tabular-nums">{projectCount}</p>
                <p className="text-sm text-text-muted">Active projects</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-surface">
              <div className="h-10 w-10 rounded-lg bg-brand-green-dark flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-medium tabular-nums">{invoices.length}</p>
                <p className="text-sm text-text-muted">Invoices</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-surface">
              <div className="h-10 w-10 rounded-lg bg-brand-green-dark flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-medium tabular-nums">{formatCurrency(stats.paid / 100)}</p>
                <p className="text-sm text-text-muted">Total paid</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Chart */}
      <Card className="border-border shrink-0 mt-4">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Monthly paid invoice totals — last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <BillingChart invoices={invoices} />
        </CardContent>
      </Card>

      {/* Invoices - scrollable within viewport */}
      <div className="flex-1 min-h-0 overflow-auto mt-6">
      {invoices.length > 0 ? (
        <div className="space-y-6">
          {/* Pending Invoices */}
          {pendingInvoices.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
                Pending
              </h2>
              <div className="space-y-3">
                {pendingInvoices.map((invoice) => (
                  <Card
                    key={invoice.id}
                    className="border-border hover:border-brand-green transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium">
                              {invoice.invoiceNumber}
                            </h3>
                            <Badge variant={statusColors[invoice.status]}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-text-secondary">
                            {invoice.description || "Invoice for project services"}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-text-muted">
                            {invoice.project && (
                              <span>Project: {invoice.project?.name}</span>
                            )}
                            {invoice.dueDate && (
                              <span>Due: {formatDate(invoice.dueDate)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <div className="text-xl font-medium">
                              {formatCurrency(invoice.amount / 100)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <InvoiceReminderButton 
                               invoiceId={invoice.id} 
                               invoiceNumber={invoice.invoiceNumber} 
                               status={invoice.status} 
                             />
                             <Button variant="ghost" size="sm" asChild>
                               <a
                                 href={`/api/invoices/${invoice.id}/pdf`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                               >
                                 <Download className="h-4 w-4" />
                               </a>
                             </Button>
                             {invoice.stripePaymentUrl ? (
                               <Button asChild>
                                 <a
                                   href={invoice.stripePaymentUrl}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                 >
                                   Pay Now
                                   <ExternalLink className="ml-2 h-4 w-4" />
                                 </a>
                               </Button>
                             ) : (
                               <Button disabled>Pay Now</Button>
                             )}
                           </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Paid Invoices */}
          {paidInvoices.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
                History
              </h2>
              <Card className="border-border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-surface z-10">
                        <tr className="border-b border-border">
                          <th className="text-left p-4 font-medium text-text-secondary">
                            Invoice
                          </th>
                          <th className="text-left p-4 font-medium text-text-secondary">
                            Project
                          </th>
                          <th className="text-left p-4 font-medium text-text-secondary">
                            Date
                          </th>
                          <th className="text-right p-4 font-medium text-text-secondary">
                            Amount
                          </th>
                          <th className="text-center p-4 font-medium text-text-secondary">
                            Status
                          </th>
                          <th className="text-right p-4 font-medium text-text-secondary">
                            Receipt
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paidInvoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b border-border last:border-0">
                            <td className="p-4 font-medium">
                              {invoice.invoiceNumber}
                            </td>
                            <td className="p-4 text-text-secondary">
                              {invoice.project?.name || "-"}
                            </td>
                            <td className="p-4 text-text-secondary">
                              {invoice.paidAt
                                ? formatDate(invoice.paidAt)
                                : formatDate(invoice.createdAt)}
                            </td>
                            <td className="p-4 text-right font-medium">
                              {formatCurrency(invoice.amount / 100)}
                            </td>
                            <td className="p-4 text-center">
                              <Badge variant="outline">Paid</Badge>
                            </td>
                            <td className="p-4 text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={`/api/invoices/${invoice.id}/pdf`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={CreditCard}
          title="No invoices"
          description="Invoices appear here once work begins. Payments are processed securely via Stripe."
        />
      )}
      </div>
    </div>
  );
}
