import { AuthGuard } from "@/components/dashboard/auth-guard";
import { HelpAssistant } from "@/components/dashboard/help-assistant";
import { CommandMenu } from "@/components/dashboard/command-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {children}
      <CommandMenu />
      <HelpAssistant />
    </AuthGuard>
  );
}
