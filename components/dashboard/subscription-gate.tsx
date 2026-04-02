import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export function SubscriptionGate({ title = "Sites & Analytics" }: { title?: string }) {
  return (
    <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-brand-green">
        <CardHeader>
          <div className="h-12 w-12 rounded-xl bg-brand-green-dark flex items-center justify-center mb-2">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl">Unlock {title}</CardTitle>
          <CardDescription>
            Subscribe to the SaaS plan to add sites, view analytics, export reports, and get weekly
            email summaries. Cancel anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" size="lg">
            <Link href="/pricing">View plans — $9.99/mo</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
