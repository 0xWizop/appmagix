import { getSession } from "@/lib/firebase-session";
import { redirect } from "next/navigation";
import { IntakeForm } from "@/components/intake/intake-form";

export default async function IntakePage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-green/20 border border-brand-green/50 mb-4">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-green" />
          <span className="text-xs font-medium text-brand-green uppercase tracking-wider">
            Project Intake
          </span>
        </div>
        <h1 className="text-3xl font-medium tracking-tight">Start a New Project</h1>
        <p className="text-text-secondary mt-2 text-sm max-w-xl mx-auto">
          Fill out this form to tell us about your project. We&apos;ll review and respond within 24 hours—no calls required.
        </p>
      </div>

      <IntakeForm
        defaultContactName={session.user.name ?? ""}
        defaultContactEmail={session.user.email ?? ""}
      />
    </div>
  );
}
