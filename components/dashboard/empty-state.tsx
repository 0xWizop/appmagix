import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  iconClassName?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  iconClassName = "bg-brand-green-dark",
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className={`h-16 w-16 rounded-full ${iconClassName} flex items-center justify-center mb-4`}
        >
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-text-secondary max-w-md mb-6">{description}</p>
        {actionLabel && actionHref && (
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
