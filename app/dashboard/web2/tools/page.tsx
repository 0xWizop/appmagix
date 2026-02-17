import { getSession } from "@/lib/firebase-session";
import { redirect } from "next/navigation";
import { ToolsClient } from "@/components/tools/tools-client";

export default async function ToolsPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight">Tools</h1>
        <p className="text-text-secondary mt-2 text-sm max-w-xl">
          Add a domain to track analytics. No project required.
        </p>
      </div>

      <ToolsClient web2Only />
    </div>
  );
}
