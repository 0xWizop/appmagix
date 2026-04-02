# MVP Feature Brainstorm – MerchantMagix

Ecommerce agency site + client dashboard. This doc is a **brainstorm** of what could count as MVP—pick and narrow based on your first launch goal.

---

## What you already have

- **Marketing**: Home, Pricing, Services, Work, Contact, Apps, Help
- **Auth**: Login, Register (Firebase + Prisma user)
- **Client dashboard**: Projects (list/detail/new), Support (tickets + thread), Billing (invoice list), Intake, CRM, Team, Settings
- **Admin**: Clients, Tickets, Invoices, Intakes
- **Data**: Users, Projects, Milestones, Tickets/Messages, Invoices (with Stripe fields), ContactSubmission, Contact, Organization

---

## MVP definition (suggested)

**“A client can sign up, see their project and one invoice, pay that invoice online, and get help via a support ticket. You (admin) can manage clients, projects, tickets, and create invoices that are payable.”**

Everything else is **post-MVP** until this loop works end-to-end.

---

## Must-have for MVP (core loop)

| # | Feature | Why MVP | Status in app |
|---|--------|---------|----------------|
| 1 | **Auth (client + admin)** | Clients and you need stable identity. | ✅ In place |
| 2 | **Contact → lead** | Form saves to DB; you can follow up. | ✅ ContactSubmission |
| 3 | **Intake → project** | Turn a lead into a project (even manually in admin). | ✅ Intake + admin intakes |
| 4 | **Client sees their project** | One place: project name, status, milestones. | ✅ Projects pages |
| 5 | **Client sees their invoices** | List with status (Pending / Paid) and one clear action. | ✅ Billing page |
| 6 | **Pay one invoice online** | Create Stripe Payment Link (or Checkout), store link on invoice, client pays; webhook marks invoice PAID. | 🔶 Schema ready; integration missing |
| 7 | **Support ticket (create + reply)** | Client opens ticket; admin replies; client sees thread. | ✅ Tickets + messages |
| 8 | **Admin: create invoice for client** | Create invoice, optionally link to project, set amount; generate Stripe link (or manual “Pay” link). | 🔶 UI exists; Stripe creation missing |

So MVP is mostly **“close the payment loop”** (Stripe) and **harden the flows you already have** (no new big surfaces).

---

## High-value, still MVP-friendly

- **Email on key events** (Resend): contact form received, ticket created/replied, invoice created. Build one at a time (e.g. contact first).
- **Invoice PDF** (optional): generate or upload PDF, store `pdfUrl`; “Download” on billing page. Nice for trust; not required for first pay.
- **Role guard on admin routes**: only `ADMIN` can hit `/dashboard/.../admin/*`. You likely have this; just confirm.
- **Invite flow**: invite link creates/links user to org or project. You have `invite/[token]`; wire it to your org/project model if you need it for MVP.

---

## Explicitly out of MVP (do later)

- **Analytics dashboard** (traffic, performance). “Coming soon” is enough for launch.
- **Multiple payment methods** beyond “pay this invoice” (e.g. subscriptions, retainers).
- **Client-facing project timeline / Gantt** (milestones list is enough for MVP).
- **CRM pipelines, automation, API builder, file convert, playground** (internal tools): use as needed, don’t block launch on them.
- **Web3 (protocol, treasury, governance)**: separate product; exclude from this MVP.

---

## Suggested MVP checklist (concrete)

Use this as a to-do list to “declare” MVP done:

- [ ] **Stripe**
  - [ ] Create Stripe product/price or use one-off Payment Links.
  - [ ] When admin creates/edits invoice, create Stripe Payment Link and save to `stripePaymentUrl`.
  - [ ] Webhook: `checkout.session.completed` (or equivalent) → find invoice by `stripeInvoiceId` or metadata → set status PAID, set `paidAt`.
  - [ ] Client “Pay” button on billing page opens `stripePaymentUrl` (you already show it).
- [ ] **Email (minimal)**
  - [ ] Contact form submit → send “New inquiry” to your team (Resend).
  - [ ] Optional: “We received your message” to submitter.
- [ ] **Guards**
  - [ ] All `/dashboard/.../admin/*` require `role === ADMIN`.
  - [ ] Clients only see their own projects, invoices, tickets.
- [ ] **Smoke test**
  - [ ] Register as client → see empty dashboard.
  - [ ] As admin: create project for that client, create invoice, set Stripe link.
  - [ ] As client: see project, see invoice, click Pay → complete in Stripe.
  - [ ] As client: open ticket; as admin: reply; client sees reply.
  - [ ] Submit contact form; admin sees submission; email received.

---

## One-sentence MVP

**“Clients can sign up, see their project and invoices, pay an invoice via Stripe, and get support via tickets; admins can manage clients, projects, tickets, and create payable invoices.”**

You can paste this into `TODO.md` and break it into tasks, or keep this file as the MVP reference and track tasks in `TODO.md`.
