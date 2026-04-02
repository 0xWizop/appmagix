"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/dashboard/help-tooltip";
import { DASHBOARD_HELP } from "@/lib/dashboard-help";

export function ProjectsHeader() {
  return (
    <div className="flex items-center justify-between gap-2">
      <h1 className="text-xl font-medium">Projects</h1>
      <div className="flex items-center gap-2">
        <HelpTooltip
          content={DASHBOARD_HELP.projects.createProject}
          side="bottom"
        />
        <Button asChild>
          <Link href="/dashboard/web2/projects/new">Create project</Link>
        </Button>
      </div>
    </div>
  );
}
