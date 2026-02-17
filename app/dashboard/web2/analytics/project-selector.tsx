"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FirestoreProject } from "@/lib/firestore";

export function ProjectSelector({
  projects,
  selectedId,
}: {
  projects: FirestoreProject[];
  selectedId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("project", value);
    if (!params.has("days")) params.set("days", "30");
    router.push(`/dashboard/web2/analytics?${params.toString()}`);
  };

  return (
    <Select value={selectedId ?? ""} onValueChange={handleChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select a site" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
