import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Webmint",
};

export default function PrivacyPage() {
  return (
    <section className="section-padding pt-24">
      <div className="container-width max-w-3xl">
        <h1 className="text-4xl font-medium mb-2">Privacy Policy</h1>
        <p className="text-text-muted text-sm mb-12">Last updated: July 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-text-secondary leading-relaxed">
          <div>
            <h2 className="text-xl font-medium text-text-primary mb-3">What we collect</h2>
            <p>When you use Webmint, we collect information you provide directly — your name, email address, and project details when you fill out our contact or intake forms. When you use the client dashboard, we store your account information and project data.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-text-primary mb-3">How we use it</h2>
            <p>We use your information to deliver the services you&apos;ve requested, communicate with you about your project, send invoices and receipts, and improve our service. We do not sell your data to third parties.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-text-primary mb-3">Analytics</h2>
            <p>If you connect your website to our analytics service, we collect anonymised page view data from your site&apos;s visitors. This data is stored securely and only accessible to you through your dashboard.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-text-primary mb-3">Payments</h2>
            <p>Payments are processed by Stripe. We do not store your card details. Stripe&apos;s privacy policy applies to payment processing.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-text-primary mb-3">Data retention</h2>
            <p>We retain your account data for as long as your account is active. You may request deletion of your data at any time by emailing hello@webmint.io.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-text-primary mb-3">Contact</h2>
            <p>Questions about this policy? Email us at <a href="mailto:hello@webmint.io" className="text-brand-green hover:underline">hello@webmint.io</a>.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

