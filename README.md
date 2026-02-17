# MerchantMagix

A full-stack ecommerce agency website and client dashboard built with Next.js 14, featuring a modern marketing site and comprehensive SaaS dashboard for managing website builds.

## Features

### Marketing Website
- **Homepage** - Hero section, service comparison, testimonials, process overview
- **Pricing Page** - Two-tier pricing (Shopify & Custom), feature comparison, FAQ
- **Services Page** - Detailed service offerings, tech stack, process breakdown
- **Portfolio Page** - Project showcase with filters
- **Contact Page** - Contact form with project type and budget selection

### Client Dashboard
- **Projects** - Track project status, milestones, and progress
- **Support Tickets** - Create and manage support requests
- **Billing** - View invoices and payment history
- **Analytics** - Coming soon: website performance tracking
- **Settings** - Profile and notification preferences

### Admin Panel
- **Clients** - Manage client accounts
- **Tickets** - Respond to support requests
- **Invoices** - Create and manage invoices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Payments**: Stripe (ready for integration)
- **Email**: Resend (ready for integration)

## Color Scheme

- **Primary Green**: `#96BF48`
- **Background**: `#0A0A0A`
- **Surface**: `#171717`
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `#A1A1A1`

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/merchantmagix.git
cd merchantmagix
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your values:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

5. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
merchantmagix/
├── app/
│   ├── (marketing)/       # Public pages (home, pricing, etc.)
│   ├── (auth)/            # Login, register pages
│   ├── dashboard/         # Client dashboard
│   │   ├── admin/         # Admin-only pages
│   │   ├── projects/      # Project management
│   │   ├── support/       # Support tickets
│   │   ├── billing/       # Invoices
│   │   └── settings/      # User settings
│   └── api/               # API routes
├── components/
│   ├── ui/                # Base UI components
│   ├── marketing/         # Marketing page components
│   └── dashboard/         # Dashboard components
├── lib/                   # Utilities and configs
├── prisma/                # Database schema
└── types/                 # TypeScript types
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Database

For production, we recommend:
- **Supabase** - Free tier available, easy Prisma integration
- **Neon** - Serverless Postgres, great for Vercel
- **PlanetScale** - MySQL alternative with branching

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Your app URL |
| `NEXTAUTH_SECRET` | Random secret for NextAuth |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `RESEND_API_KEY` | Resend API key for emails |

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

## License

MIT License - feel free to use this for your own projects!

---

Built with passion for ecommerce entrepreneurs.
