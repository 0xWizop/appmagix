import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Webmint",
};

export default function TermsPage() {
  return (
    <section className="section-padding pt-24">
      <div className="container-width max-w-3xl">
        <h1 className="text-4xl font-medium mb-2">Terms of Service</h1>
        <p className="text-text-muted text-sm mb-12">Last updated: July 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-text-secondary leading-relaxed">
          <div>
            <h2 className="text-xl font-medium text-text-primary mb-3">Services</h2>
            <p>Webmint provides website and application development services. By engaging us for a project or using our client dashboard, you agree to these terms.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-text-primary mb-3">Payments</h2>
            <p>Payments are split into milestones as agreed in your project proposal. Invoices are due within 14 days of issue. Late payments may pause project work. All payments are non-refundable once development work has begun on a milestone.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-text-primary mb-3">Ownership</h2>
            <p>On receipt of final payment, you own the code and assets we build for you. We retain the right to display completed work in our portfolio unless you request otherwise in writing.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-text-primary mb-3">Your responsibilities</h2>
            <p>You are responsible for providing accurate content, timely feedback, and any third-party account access needed to complete your project. Delays caused by late feedback may extend the project timeline.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-text-primary mb-3">Dashboard use</h2>
            <p>The Webmint client dashboard is provided to manage your active projects. You may not share your login credentials or use the dashboard for any unlawful purpose.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-text-primary mb-3">Limitation of liability</h2>
            <p>Webmint is not liable for any indirect, incidental, or consequential damages arising from use of our services. Our total liability is limited to the amount paid for the specific project in question.</p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-text-primary mb-3">Contact</h2>
            <p>Questions? Email us at <a href="mailto:hello@webmint.io" className="text-brand-green hover:underline">hello@webmint.io</a>.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
