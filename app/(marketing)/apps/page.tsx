import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimateIn } from "@/components/marketing/animate-in";
import { Package, ArrowRight, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Shopify Apps | MerchantMagix",
  description:
    "Shopify mini apps built by MerchantMagix to power your store. More apps coming soon.",
};

const apps = [
  { name: "App One", tagline: "Coming soon", description: "First of our Shopify mini apps. Details coming soon." },
  { name: "App Two", tagline: "Coming soon", description: "Second app in our lineup. Built for merchants." },
  { name: "App Three", tagline: "Coming soon", description: "Third app—stay tuned for launch." },
  { name: "App Four", tagline: "Coming soon", description: "Fourth app. More power for your store." },
];

export default function AppsPage() {
  return (
    <div className="min-h-screen">
      <section className="section-padding">
        <div className="container-width">
          <AnimateIn animation="fadeUp" rootMargin="0px">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <ShoppingBag className="w-3 h-3 mr-1" />
                Shopify Ecosystem
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-medium mb-4">
                Our Shopify Mini Apps
              </h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                We&apos;re building apps that integrate directly with your Shopify
                store. Four apps are in the works—check back soon for launch details.
              </p>
            </div>
          </AnimateIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {apps.map((app, i) => (
              <AnimateIn key={app.name} delay={i * 80} animation="fadeUp">
                <Card className="group hover:border-brand-green/50 transition-colors shadow-none h-full flex flex-col">
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="h-12 w-12 rounded-xl bg-brand-green/20 flex items-center justify-center mb-4 group-hover:bg-brand-green/30 transition-colors">
                      <Package className="h-6 w-6 text-brand-green" />
                    </div>
                    <h2 className="text-xl font-medium mb-1">{app.name}</h2>
                    <p className="text-sm text-text-muted mb-4">{app.tagline}</p>
                    <p className="text-sm text-text-secondary flex-1">
                      {app.description}
                    </p>
                    <Badge variant="secondary" className="mt-4 w-fit">
                      Shopify
                    </Badge>
                  </CardContent>
                </Card>
              </AnimateIn>
            ))}
          </div>

          <AnimateIn animation="fadeUp">
            <div className="text-center space-y-6">
              <p className="text-text-secondary">
                Want a custom app or website instead? We do that too.
              </p>
              <Button size="lg" asChild>
                <Link href="/contact">
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimateIn>
        </div>
      </section>
    </div>
  );
}
