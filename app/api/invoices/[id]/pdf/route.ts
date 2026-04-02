import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getOrCreateUserByFirebaseUid } from "@/lib/get-prisma-user";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: invoiceId } = await params;
    const user = await getOrCreateUserByFirebaseUid(
      session.user.id,
      session.user.email,
      session.user.name
    );

    const invoice = await db.invoice.findFirst({
      where: { id: invoiceId, userId: user.id },
      include: { project: { select: { name: true } }, user: { select: { name: true, email: true } } },
    });

    if (!invoice) {
      return new NextResponse("Invoice not found", { status: 404 });
    }

    const fmt = (cents: number) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
    const fmtDate = (d: Date | null) =>
      d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

    const statusColor = invoice.status === "PAID" ? "#00D166" : invoice.status === "PENDING" ? "#f59e0b" : "#6b7280";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      padding: 40px 20px;
    }

    .page {
      max-width: 740px;
      margin: 0 auto;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 32px rgba(0,0,0,0.08);
    }

    /* Header */
    .header {
      background: #0d1117;
      padding: 40px 48px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .logo {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.5px;
    }
    .logo span { color: #00D166; }
    .invoice-meta { text-align: right; }
    .invoice-number { font-size: 24px; font-weight: 700; color: #fff; }
    .invoice-date { font-size: 13px; color: #9ca3af; margin-top: 4px; }
    .status-badge {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: ${statusColor}22;
      color: ${statusColor};
      border: 1px solid ${statusColor}44;
    }

    /* Body */
    .body { padding: 48px; }

    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 48px;
    }
    .party-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .party-name { font-size: 16px; font-weight: 600; color: #0f172a; }
    .party-detail { font-size: 13px; color: #64748b; margin-top: 2px; }

    /* Line items */
    .table-wrap {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 32px;
    }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #f8fafc; }
    th {
      padding: 14px 20px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
    }
    th:last-child { text-align: right; }
    td {
      padding: 16px 20px;
      border-top: 1px solid #f1f5f9;
      font-size: 14px;
      color: #334155;
    }
    td:last-child { text-align: right; font-weight: 500; }
    .description-cell { color: #64748b; font-size: 12px; margin-top: 2px; }

    /* Total */
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    .totals-box {
      min-width: 240px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 14px;
      color: #64748b;
      border-bottom: 1px solid #f1f5f9;
    }
    .total-row.grand {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      border-bottom: none;
      padding-top: 16px;
    }
    .total-row.grand .amount { color: #00D166; }

    /* Footer */
    .footer {
      padding: 28px 48px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-note { font-size: 12px; color: #94a3b8; }
    .footer-link { font-size: 12px; color: #00D166; text-decoration: none; }

    /* Print/auto-print button */
    .print-bar {
      max-width: 740px;
      margin: 0 auto 20px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      font-family: inherit;
    }
    .btn-primary { background: #00D166; color: #000; }
    .btn-ghost { background: #e2e8f0; color: #334155; }

    @media print {
      body { background: #fff; padding: 0; }
      .page { box-shadow: none; border-radius: 0; }
      .print-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <button class="btn btn-ghost" onclick="window.close()">Close</button>
    <button class="btn btn-primary" onclick="window.print()">🖨 Print / Save PDF</button>
  </div>

  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="logo">merchant<span>magix</span>.</div>
      <div class="invoice-meta">
        <div class="invoice-number">${invoice.invoiceNumber}</div>
        <div class="invoice-date">Created ${fmtDate(invoice.createdAt)}</div>
        <div class="status-badge">${invoice.status}</div>
      </div>
    </div>

    <!-- Body -->
    <div class="body">
      <div class="parties">
        <div>
          <div class="party-label">From</div>
          <div class="party-name">MerchantMagix</div>
          <div class="party-detail">merchantmagix@gmail.com</div>
        </div>
        <div>
          <div class="party-label">Bill To</div>
          <div class="party-name">${invoice.user.name || "Client"}</div>
          <div class="party-detail">${invoice.user.email}</div>
          ${invoice.project ? `<div class="party-detail">Project: ${invoice.project.name}</div>` : ""}
        </div>
      </div>

      <!-- Line Items -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div>${invoice.description || "Professional services"}</div>
                ${invoice.dueDate ? `<div class="description-cell">Due: ${fmtDate(invoice.dueDate)}</div>` : ""}
              </td>
              <td>${fmt(invoice.amount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div class="totals">
        <div class="totals-box">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${fmt(invoice.amount)}</span>
          </div>
          <div class="total-row">
            <span>Tax</span>
            <span>$0.00</span>
          </div>
          <div class="total-row grand">
            <span>Total</span>
            <span class="amount">${fmt(invoice.amount)}</span>
          </div>
        </div>
      </div>

      ${invoice.status === "PAID" && invoice.paidAt ? `
      <div style="padding:16px 20px; background:#00D16611; border: 1px solid #00D16633; border-radius:10px; display:flex; align-items:center; gap:10px;">
        <span style="font-size:18px;">✓</span>
        <div>
          <div style="font-weight:600; color:#00D166;">Paid in full</div>
          <div style="font-size:13px; color:#64748b;">Payment received on ${fmtDate(invoice.paidAt)}</div>
        </div>
      </div>
      ` : ""}
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-note">Thank you for your business!</div>
      <a href="https://merchantmagix.com" class="footer-link">merchantmagix.com</a>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Invoice PDF route:", error);
    return new NextResponse("Failed to generate invoice", { status: 500 });
  }
}
