# MerchantMagix Dashboard Roadmap

**Platform:** App/website + SaaS for ecommerce  
**Current:** Billing ✓ | Support ✓ | Apps ✓ | Projects ✓

---

## 1. Analytics Dashboard (Client Website/App Analytics)

**Goal:** Let clients see traffic, conversions, and performance for *their* live site or app.

### Integration Options

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **A. JavaScript snippet** | Full control, real-time, no extra cost | Need to host the script, build tracking endpoints | Medium |
| **B. Google Analytics 4 (GA4)** | Free, mature, conversions, audiences | Less control, GA4 API limits, OAuth setup | Medium |
| **C. Plausible / Fathom / Umami** | Privacy-focused, simple API | Paid (or self-host Umami) | Low–Medium |
| **D. Custom tracking API** | Full control, your branding | You build everything | High |

### Recommended: Hybrid (Snippet + API)

1. **Script tag** – Client adds a script to their site: `merchantmagix.com/embed.js`
2. **Script sends events** – Page views, custom events (add to cart, checkout), optional consent
3. **Your API** – Stores events in Firestore (or BigQuery for scale)
4. **Dashboard** – Query by `projectId` / `userId` and show charts

### Data Model (Firestore)

```
analytics_events/{eventId}
  - projectId (or siteId)
  - userId (owner)
  - type: "page_view" | "custom" | "ecommerce"
  - path, referrer, timestamp
  - metadata: { eventName, value, ... }
```

### Features to Build

- [ ] **Connecting APIs** – Project settings page: “Add your site URL” → we validate/verify ownership
- [ ] **Embed script** – `/embed.js` that reports to your tracking API
- [ ] **Event ingestion** – API endpoint that accepts events (with project token for auth)
- [ ] **Analytics UI** – Charts for page views, top pages, conversions, simple funnels
- [ ] **Site switcher** – If user has multiple projects/sites, dropdown to switch

---

## 2. Connecting APIs / Site Integration

**Goal:** Associate a client’s live site or app with a project and enable analytics/tools.

### Flow

1. **Add site** – Project detail → “Connect site” → enter URL
2. **Verify ownership** – DNS TXT record or meta tag
3. **Store** – `project.websiteUrl`, `project.verifiedAt`, `project.siteToken`
4. **Script** – Client adds `<script src="...?token=...">` to their site

### Verification Methods

- **Meta tag** – `<meta name="merchantmagix-site" content="TOKEN">`
- **DNS TXT** – `merchantmagix-verify=TOKEN`
- **File** – `/.well-known/merchantmagix-verify` with token

---

## 3. Extra Dashboard Features

### High Priority

| Feature | Description |
|---------|-------------|
| **Notifications** | In-app notices for ticket replies, project updates, invoice reminders |
| **Activity / Audit log** | Timeline of changes (project status, milestones, ticket replies) |
| **Onboarding checklist** | “Complete profile”, “Add first project”, “Connect site” |
| **Project health** | Simple status: Healthy / Needs attention / Overdue |

### Medium Priority

| Feature | Description |
|---------|-------------|
| **File storage** | Store assets, designs, or docs per project (Firebase Storage) |
| **Team / collaborators** | Add team members to a project (invite by email) |
| **Custom domains** | Let clients point their domain at their site |
| **Webhooks** | Notify external systems on events (e.g. project launched) |

### Lower Priority

| Feature | Description |
|---------|-------------|
| **API access** | API keys for clients to integrate with their tools |
| **Usage / limits** | Track usage vs plan limits (e.g. storage, requests) |
| **White-label** | Custom branding per client |
| **Multi-currency** | Billing in multiple currencies |

---

## 4. Implementation Order

1. **Sidebar fix** ✓ (done)
2. **Analytics: data model + API** ✓ (done)
3. **Connect site flow** ✓ (done) – Meta tag + embed script, verify button
4. **Embed script** ✓ (done) – `/embed.js` sends page views to API
5. **Analytics dashboard UI** ✓ (done) – Recharts, project selector, top pages
6. **Notifications** – Basic in-app + optional email

---

## 5. Tech Notes

- **Charts:** Recharts or Tremor for React
- **Analytics storage:** Firestore for small scale; BigQuery/ClickHouse if volume grows
- **Script hosting:** Next.js static route or CDN (e.g. Vercel Edge)
- **Rate limiting:** Protect ingestion API (e.g. Upstash, Vercel KV)
