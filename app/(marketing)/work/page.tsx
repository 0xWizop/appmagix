import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ExternalLink } from "lucide-react";
import { MiniSitePreview } from "@/components/work/mini-site-preview";

// Placeholder projects - replace with real data later
const projects = [
  {
    id: 1,
    title: "Luxe Botanics",
    description:
      "Premium skincare brand with a focus on natural ingredients. Full Shopify Plus build with custom product customization.",
    category: "shopify",
    image: "/placeholder-project-1.jpg",
    tags: ["Shopify Plus", "Custom Theme", "Subscriptions"],
    results: "+150% conversion rate",
    url: "#",
  },
  {
    id: 2,
    title: "Urban Threads",
    description:
      "Streetwear brand targeting Gen Z. Custom headless build with Next.js and Shopify as backend.",
    category: "custom",
    image: "/placeholder-project-2.jpg",
    tags: ["Headless", "Next.js", "Shopify API"],
    results: "$2M first year revenue",
    url: "#",
  },
  {
    id: 3,
    title: "FitGear Pro",
    description:
      "Fitness equipment retailer. Shopify store with custom configurator for building home gym packages.",
    category: "shopify",
    image: "/placeholder-project-3.jpg",
    tags: ["Shopify", "Custom App", "Product Bundling"],
    results: "+40% AOV increase",
    url: "#",
  },
  {
    id: 4,
    title: "Artisan Coffee Co",
    description:
      "Specialty coffee roaster with subscription model. Custom site with advanced subscription management.",
    category: "custom",
    image: "/placeholder-project-4.jpg",
    tags: ["Custom Build", "Subscriptions", "Stripe"],
    results: "5,000+ subscribers",
    url: "#",
  },
  {
    id: 5,
    title: "Pet Paradise",
    description:
      "Pet supplies store with loyalty program. Full Shopify build with rewards integration.",
    category: "shopify",
    image: "/placeholder-project-5.jpg",
    tags: ["Shopify", "Loyalty Program", "Klaviyo"],
    results: "+200% repeat customers",
    url: "#",
  },
  {
    id: 6,
    title: "Modern Home",
    description:
      "Furniture retailer with AR product visualization. Custom build with 3D product viewer.",
    category: "custom",
    image: "/placeholder-project-6.jpg",
    tags: ["Custom Build", "AR/3D", "Product Visualization"],
    results: "-30% return rate",
    url: "#",
  },
];

function ProjectCard({ project }: { project: (typeof projects)[0] }) {
  return (
    <Card className="group overflow-hidden hover:border-brand-green/50 transition-all shadow-none">
      {/* Mini interactive website preview */}
      <div className="p-3 pb-0 bg-surface/50">
        <MiniSitePreview project={project} />
      </div>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <h3 className="text-xl font-medium mb-2">{project.title}</h3>
        <p className="text-text-secondary text-sm mb-4">{project.description}</p>
        <div className="flex items-center justify-between">
          <Badge variant="default">{project.results}</Badge>
          <span className="text-brand-green text-xs flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            Click to explore
            <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WorkPage() {
  const shopifyProjects = projects.filter((p) => p.category === "shopify");
  const customProjects = projects.filter((p) => p.category === "custom");

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding pt-24">
        <div className="container-width">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-brand-green/20 text-brand-green border border-brand-green/50">Our Work</Badge>
            <h1 className="text-4xl sm:text-5xl font-medium mb-6">
              Projects that{" "}
              <span className="gradient-text">drive results</span>
            </h1>
            <p className="text-lg text-text-secondary">
              A selection of ecommerce projects we&apos;ve built for amazing brands.
              Each one designed to convert and scale.
            </p>
          </div>

          {/* Project Filters */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mx-auto mb-8 w-fit">
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="shopify">Shopify</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shopify">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shopifyProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-surface">
        <div className="container-width">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { stat: "100+", label: "Stores Built" },
              { stat: "$10M+", label: "Revenue Generated" },
              { stat: "98%", label: "Client Satisfaction" },
              { stat: "4.9/5", label: "Average Rating" },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-4xl font-medium text-brand-green mb-2">
                  {item.stat}
                </div>
                <div className="text-text-secondary">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-width">
          <Card className="bg-gradient-to-br from-brand-green/20 via-transparent to-transparent border-brand-green/30">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-medium mb-4">
                Want to be our next success story?
              </h2>
              <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                Let&apos;s discuss your project and see how we can help you achieve
                similar results.
              </p>
              <Button size="xl" asChild>
                <Link href="/contact">
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
