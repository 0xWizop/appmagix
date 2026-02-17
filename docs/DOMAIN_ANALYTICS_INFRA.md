# Domain & Analytics Infrastructure

**Goal:** Open infra SaaS — connect any website/domain and use our tools (analytics, webhooks, etc.) on it.

---

## Current State

### What Exists

| Component | Status | Notes |
|-----------|--------|------|
| **Connect site** | ✓ | Add URL → get meta tag + embed script |
| **Verification** | ✓ | Meta tag only (server fetches HTML, checks for tag) |
| **Embed script** | ✓ | `embed.js` sends page_view events to `/api/analytics/events` |
| **Event ingestion** | ✓ | Firestore `analytics_events` by `projectId` |
| **Analytics UI** | ✓ | Recharts, project selector, top pages, daily views |
| **Site → Project** | ✓ | Site is tied to a **project** via `websiteUrl`, `siteToken` |

### Flow Today

1. User creates a **project** (e.g. "My Store")
2. In project settings → "Connect site" → enter URL
3. System returns meta tag + embed script
4. User adds both to their site
5. User clicks "Verify" → we fetch the URL and check for meta tag
6. Once verified, `embed.js` sends events with `token` → API maps token to `projectId` → stores in Firestore
7. Analytics dashboard shows data per project

### Limitation

**Sites are tied to projects.** There is no standalone "Sites" or "Domains" entity. If you want to connect a domain without a project (e.g. "I just want analytics for my blog"), you currently must create a project first.

---

## Gaps for Open Infra SaaS

### 1. Standalone Sites / Domains

**Add a `sites` (or `domains`) collection** so users can connect any domain without creating a project.

- `sites/{siteId}` — `ownerId`, `domain`, `siteToken`, `verifiedAt`, `projectId?` (optional link)
- User can connect `example.com` → get analytics → optionally link to a project later

### 2. Multiple Domains per Project

- Allow one project to have multiple connected sites
- Or: keep 1:1 but add a "Sites" section where users manage all domains in one place

### 3. Analytics by Domain

- Analytics query by `siteId` or `domain` (not just `projectId`)
- `embed.js` could send `domain` in metadata for correlation

### 4. Domain Verification

- Current: meta tag only
- Need: DNS TXT, CNAME, or file-based verification for more control

---

## Additional Verification Providers

| Method | Use case | Effort | Notes |
|--------|----------|--------|-------|
| **Meta tag** | ✓ Already | — | Works for any site where user can edit HTML |
| **DNS TXT** | Root domain ownership | Medium | Add `merchantmagix-verify=TOKEN` in DNS TXT records |
| **DNS CNAME** | Subdomain verification | Medium | Add CNAME record for `verify.example.com` |
| **File** | No HTML access | Low | `/.well-known/merchantmagix-verify` with token content |
| **OAuth / API** | Connect third-party | High | e.g. Vercel, Netlify, Shopify — verify via their API |

### Recommended: Add Meta Tag + File + DNS TXT

1. **Meta tag** – keep current
2. **File** – `GET https://example.com/.well-known/merchantmagix-verify` → returns token
3. **DNS TXT** – Check `_merchantmagix-challenge.example.com` TXT record

---

## Provider Integrations (Future)

| Provider | Purpose | What we get |
|----------|---------|-------------|
| **Vercel** | OAuth / API | Verify domain ownership, list deployments |
| **Netlify** | OAuth / API | Verify domain, deploy hooks |
| **Cloudflare** | OAuth / API | DNS management, verify |
| **Shopify** | OAuth | App install, domain verification |
| **Google Analytics** | OAuth / API | Import GA4 data (optional) |
| **Plausible / Umami** | API | Import analytics (optional) |

---

## Implementation Order

1. **Standalone sites** – Add `sites` collection, API to add/verify domain without project
2. **File verification** – Add `/.well-known/merchantmagix-verify` check
3. **DNS TXT** – Add optional DNS verification (requires DNS lookup API)
4. **Sites dashboard** – List all connected domains, manage from one place
5. **Provider integrations** – Start with Vercel or Netlify for OAuth-based verification

---

## Data Model

### Option A: Sites as standalone

```
sites/{siteId}
  - ownerId
  - domain (e.g. "example.com")
  - siteToken
  - verifiedAt
  - projectId? (optional)
  - createdAt
```

### Option B: Keep project-based, add sites subcollection

```
projects/{projectId}/sites/{siteId}
  - domain
  - siteToken
  - verifiedAt
```

- Option A: More flexible for "connect any domain" use case
- Option B: Simpler for project-centric users

---

## embed.js

Current: `embed.js?token=XXX` → token maps to project via `siteToken` on project.

If we add `sites`:
- Token can map to either `project` or `site`
- `ingestAnalyticsEvent` checks both: `projects` by `siteToken` OR `sites` by `siteToken`
