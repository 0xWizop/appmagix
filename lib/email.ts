import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || "MerchantMagix <merchantmagix@gmail.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://merchantmagix.com";

function baseLayout(content: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0a; color: #e5e7eb; padding: 32px 24px; border-radius: 12px;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 600; color: #ffffff;">merchant<span style="color: #00D166;">magix</span>.</span>
      </div>
      ${content}
      <hr style="border: none; border-top: 1px solid #1f2937; margin: 24px 0;" />
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        You received this from <a href="${APP_URL}" style="color: #00D166;">MerchantMagix</a>. 
        Questions? Reply to this email or visit your <a href="${APP_URL}/dashboard" style="color: #00D166;">dashboard</a>.
      </p>
    </div>
  `;
}

// ─── Invoice Reminder ────────────────────────────────────────────────────────
export async function sendInvoiceReminder({
  to,
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  paymentUrl,
}: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate?: string;
  paymentUrl?: string;
}) {
  if (!resend) return { ok: false, error: "Resend not configured" };

  const dueLine = dueDate ? `<p style="margin: 0 0 8px 0; color: #9ca3af;">Due: <strong style="color: #f87171;">${dueDate}</strong></p>` : "";
  const payBtn = paymentUrl
    ? `<a href="${paymentUrl}" style="display: inline-block; margin-top: 16px; background: #00D166; color: #000; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Pay Now →</a>`
    : `<a href="${APP_URL}/dashboard/web2/billing" style="display: inline-block; margin-top: 16px; background: #00D166; color: #000; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View Invoice →</a>`;

  const content = `
    <h2 style="color: #ffffff; margin: 0 0 8px 0;">Invoice Payment Reminder</h2>
    <p style="color: #9ca3af; margin: 0 0 24px 0;">Hi ${clientName}, just a friendly reminder that the following invoice is due.</p>
    <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #ffffff;">Invoice ${invoiceNumber}</p>
      ${dueLine}
      <p style="margin: 0; font-size: 24px; font-weight: 700; color: #00D166;">${amount}</p>
    </div>
    ${payBtn}
    <p style="color: #6b7280; font-size: 13px; margin-top: 16px;">If you've already paid, please disregard this message.</p>
  `;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Payment reminder: Invoice ${invoiceNumber} — ${amount}`,
      html: baseLayout(content),
    });
    return { ok: true };
  } catch (err) {
    console.error("[sendInvoiceReminder]", err);
    return { ok: false, error: String(err) };
  }
}

// ─── Booking Confirmation ─────────────────────────────────────────────────────
export async function sendBookingConfirmation({
  to,
  clientName,
  bookingTitle,
  startTime,
  endTime,
  projectName,
  description,
}: {
  to: string;
  clientName: string;
  bookingTitle: string;
  startTime: Date;
  endTime: Date;
  projectName?: string;
  description?: string;
}) {
  if (!resend) return { ok: false, error: "Resend not configured" };

  const fmt = (d: Date) =>
    d.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });

  const projectLine = projectName
    ? `<p style="margin: 0 0 4px 0; color: #9ca3af;">Project: <span style="color: #e5e7eb;">${projectName}</span></p>`
    : "";
  const descLine = description
    ? `<p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 13px;">${description}</p>`
    : "";

  const content = `
    <h2 style="color: #ffffff; margin: 0 0 8px 0;">Booking Confirmed ✓</h2>
    <p style="color: #9ca3af; margin: 0 0 24px 0;">Hi ${clientName}, your booking has been confirmed. Here are the details:</p>
    <div style="background: #111827; border: 1px solid #1f2937; border-left: 3px solid #00D166; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #ffffff;">${bookingTitle}</p>
      <p style="margin: 0 0 4px 0; color: #9ca3af;">Start: <span style="color: #e5e7eb;">${fmt(startTime)}</span></p>
      <p style="margin: 0 0 4px 0; color: #9ca3af;">End: <span style="color: #e5e7eb;">${fmt(endTime)}</span></p>
      ${projectLine}
      ${descLine}
    </div>
    <a href="${APP_URL}/dashboard/web2/booking" style="display: inline-block; background: #00D166; color: #000; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View in Dashboard →</a>
  `;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Booking confirmed: ${bookingTitle}`,
      html: baseLayout(content),
    });
    return { ok: true };
  } catch (err) {
    console.error("[sendBookingConfirmation]", err);
    return { ok: false, error: String(err) };
  }
}

// ─── Intake Notification (Admin) ──────────────────────────────────────────────
export async function sendIntakeNotification(data: {
  contactName: string;
  contactEmail: string;
  projectType: string;
  businessName?: string;
  budget?: string;
}) {
  if (!resend) return { ok: false, error: "Resend not configured" };

  const content = `
    <h2 style="color: #ffffff; margin: 0 0 8px 0;">New Project Intake</h2>
    <p style="color: #9ca3af; margin: 0 0 24px 0;">A new project intake form has been submitted.</p>
    <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <p style="margin: 0 0 4px 0; color: #9ca3af;">Name: <span style="color: #e5e7eb;">${data.contactName}</span></p>
      <p style="margin: 0 0 4px 0; color: #9ca3af;">Email: <span style="color: #e5e7eb;">${data.contactEmail}</span></p>
      <p style="margin: 0 0 4px 0; color: #9ca3af;">Type: <span style="color: #e5e7eb;">${data.projectType}</span></p>
      ${data.businessName ? `<p style="margin: 0 0 4px 0; color: #9ca3af;">Business: <span style="color: #e5e7eb;">${data.businessName}</span></p>` : ""}
      ${data.budget ? `<p style="margin: 0 0 4px 0; color: #9ca3af;">Budget: <span style="color: #e5e7eb;">${data.budget}</span></p>` : ""}
    </div>
    <a href="${APP_URL}/dashboard/admin/intakes" style="display: inline-block; background: #00D166; color: #000; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View in Admin Panel →</a>
  `;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_FROM, // Send to admin
      subject: `New Intake: ${data.projectType} from ${data.contactName}`,
      html: baseLayout(content),
    });
    return { ok: true };
  } catch (err) {
    console.error("[sendIntakeNotification]", err);
    return { ok: false, error: String(err) };
  }
}

// ─── Invoice Created (Client) ────────────────────────────────────────────────
export async function sendInvoiceCreatedEmail({
  to,
  clientName,
  invoiceNumber,
  amount,
  paymentUrl,
}: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  paymentUrl: string;
}) {
  if (!resend) return { ok: false, error: "Resend not configured" };

  const content = `
    <h2 style="color: #ffffff; margin: 0 0 8px 0;">Invoice Created</h2>
    <p style="color: #9ca3af; margin: 0 0 24px 0;">Hi ${clientName}, an invoice has been created for your project.</p>
    <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #ffffff;">Invoice ${invoiceNumber}</p>
      <p style="margin: 0; font-size: 24px; font-weight: 700; color: #00D166;">${amount}</p>
    </div>
    <div style="text-align: center;">
      <a href="${paymentUrl}" style="display: inline-block; background: #00D166; color: #000; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">Pay Invoice Now →</a>
    </div>
    <p style="color: #6b7280; font-size: 13px; margin-top: 24px; text-align: center;">
      You can also view this and all your invoices in your <a href="${APP_URL}/dashboard/web2/billing" style="color: #00D166;">billing dashboard</a>.
    </p>
  `;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Invoice ${invoiceNumber} is ready for payment — ${amount}`,
      html: baseLayout(content),
    });
    return { ok: true };
  } catch (err) {
    console.error("[sendInvoiceCreatedEmail]", err);
    return { ok: false, error: String(err) };
  }
}

// ─── Ticket Reply Notification ────────────────────────────────────────────────
export async function sendTicketReplyNotification({
  to,
  clientName,
  ticketSubject,
  replyContent,
  ticketId,
  replierName,
}: {
  to: string;
  clientName: string;
  ticketSubject: string;
  replyContent: string;
  ticketId: string;
  replierName?: string;
}) {
  if (!resend) return { ok: false, error: "Resend not configured" };

  const preview = replyContent.length > 200 ? replyContent.slice(0, 200) + "…" : replyContent;
  const from = replierName ? replierName : "The MerchantMagix Team";

  const content = `
    <h2 style="color: #ffffff; margin: 0 0 8px 0;">New Reply on Your Ticket</h2>
    <p style="color: #9ca3af; margin: 0 0 24px 0;">Hi ${clientName}, you have a new reply on your support ticket.</p>
    <div style="background: #111827; border: 1px solid #1f2937; border-left: 3px solid #00D166; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Ticket</p>
      <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #ffffff;">${ticketSubject}</p>
      <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">Reply from <strong style="color: #9ca3af;">${from}</strong></p>
      <p style="margin: 8px 0 0 0; color: #e5e7eb; font-size: 14px; line-height: 1.6;">${preview}</p>
    </div>
    <a href="${APP_URL}/dashboard/web2/support/${ticketId}" style="display: inline-block; background: #00D166; color: #000; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View Full Reply →</a>
    <p style="color: #6b7280; font-size: 13px; margin-top: 16px;">You can reply directly from your support dashboard.</p>
  `;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Re: ${ticketSubject} — new reply`,
      html: baseLayout(content),
    });
    return { ok: true };
  } catch (err) {
    console.error("[sendTicketReplyNotification]", err);
    return { ok: false, error: String(err) };
  }
}
