"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
  websiteUrl?: string;
}

interface Site {
  id: string;
  domain: string;
}

export function SourceSelector({
  projects,
  sites,
  selectedValue,
}: {
  projects: Project[];
  sites: Site[];
  selectedValue?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("source", value);
    if (!params.has("days")) params.set("days", "30");
    router.push(`/dashboard/web2/analytics?${params.toString()}`);
  };

  const connectedProjects = projects.filter((p) => p.websiteUrl);
  const allSources = [
    ...connectedProjects.map((p) => ({ value: `project:${p.id}`, label: p.name })),
    ...sites.map((s) => ({ value: `site:${s.id}`, label: s.domain })),
  ];

  if (allSources.length === 0) return null;

  return (
    <Select value={selectedValue ?? ""} onValueChange={handleChange}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Select a site" />
      </SelectTrigger>
      <SelectContent>
        {connectedProjects.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-medium text-text-muted">Projects</div>
            {connectedProjects.map((p) => (
              <SelectItem key={p.id} value={`project:${p.id}`}>
                {p.name}
              </SelectItem>
            ))}
          </>
        )}
        {sites.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-medium text-text-muted">Standalone sites</div>
            {sites.map((s) => (
              <SelectItem key={s.id} value={`site:${s.id}`}>
                {s.domain}
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
}
