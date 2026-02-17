import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ExternalLink } from "lucide-react";

const apps = [
  { id: "app-one", name: "App One", tagline: "Coming soon", storeUrl: null },
  { id: "app-two", name: "App Two", tagline: "Coming soon", storeUrl: null },
  { id: "app-three", name: "App Three", tagline: "Coming soon", storeUrl: null },
  { id: "app-four", name: "App Four", tagline: "Coming soon", storeUrl: null },
];

export default function DashboardAppsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {apps.map((app) => (
          <Card
            key={app.id}
            className="hover:border-brand-green transition-colors"
          >
            <CardContent className="p-6">
              <div className="h-10 w-10 rounded-lg bg-brand-green-dark flex items-center justify-center mb-4">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-medium mb-1">{app.name}</h2>
              <p className="text-sm text-text-muted mb-4">{app.tagline}</p>
              <Badge variant="secondary" className="text-xs">
                Shopify
              </Badge>
              {app.storeUrl ? (
                <Link
                  href={app.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-sm text-brand-green hover:underline"
                >
                  Open in App Store
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              ) : (
                <p className="mt-4 text-xs text-text-muted">Launching soon</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <p className="text-text-secondary mb-2">
            Want to see our apps on the marketing site?
          </p>
          <Link
            href="/apps"
            className="text-sm font-medium text-brand-green hover:underline"
          >
            View all apps →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
