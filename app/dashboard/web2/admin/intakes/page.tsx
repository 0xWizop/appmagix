import { getSession } from "@/lib/firebase-session";
import { redirect } from "next/navigation";
import { getIntakesForAdmin } from "@/lib/firestore";
import { IntakesClient } from "./intakes-client";

export default async function AdminIntakesPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const isDeveloper = session.user.role === "ADMIN" || session.user.accountType === "DEVELOPER";
  if (!isDeveloper) {
    redirect("/dashboard");
  }

  let intakes: Awaited<ReturnType<typeof getIntakesForAdmin>> = [];
  try {
    intakes = await getIntakesForAdmin();
  } catch (e) {
    console.error("Intakes fetch error:", e);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-green/20 border border-brand-green/50 mb-4">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-green" />
          <span className="text-xs font-medium text-brand-green uppercase tracking-wider">
            Intake Queue
          </span>
        </div>
        <h1 className="text-3xl font-medium tracking-tight">Project Intakes</h1>
        <p className="text-text-secondary mt-2 text-sm max-w-xl">
          Review submitted intakes and create projects. We respond via form/email—no calls required.
        </p>
      </div>

      <IntakesClient initialIntakes={intakes} />
    </div>
  );
}
