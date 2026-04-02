"use client";

import { useState, useCallback } from "react";
import { Tag, X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";

const PRESET_TAGS = [
  { label: "VIP", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { label: "Lead", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { label: "Past Client", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { label: "Hot", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { label: "Follow Up", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { label: "Partner", color: "bg-brand-green/20 text-brand-green border-brand-green/30" },
  { label: "Cold", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  { label: "Newsletter", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
];

export const TAG_COLOR_MAP: Record<string, string> = Object.fromEntries(
  PRESET_TAGS.map((t) => [t.label, t.color])
);

const DEFAULT_COLOR = "bg-surface text-text-muted border-border";

interface ContactTagsProps {
  contactId: string;
  initialTags: string[];
  readOnly?: boolean;
}

export function ContactTags({ contactId, initialTags, readOnly = false }: ContactTagsProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const toast = useToast();

  const saveTags = useCallback(async (next: string[]) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/contacts/tags`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contactId, tags: next }),
      });
      if (!res.ok) throw new Error("Failed to save tags");
      setTags(next);
    } catch (err) {
      toast.error("Could not save tags", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }, [contactId, toast]);

  const toggleTag = (label: string) => {
    const next = tags.includes(label)
      ? tags.filter((t) => t !== label)
      : [...tags, label];
    saveTags(next);
  };

  const removeTag = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveTags(tags.filter((t) => t !== label));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border",
            TAG_COLOR_MAP[tag] ?? DEFAULT_COLOR
          )}
        >
          {tag}
          {!readOnly && (
            <button
              onClick={(e) => removeTag(tag, e)}
              className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </span>
      ))}

      {!readOnly && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-dashed border-border text-text-muted hover:border-brand-green/50 hover:text-brand-green transition-colors"
              aria-label="Add tag"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Add tag
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-2">
            <p className="text-xs text-text-muted mb-2 px-1">Select tags</p>
            <div className="grid gap-1">
              {PRESET_TAGS.map((preset) => {
                const isSelected = tags.includes(preset.label);
                return (
                  <button
                    key={preset.label}
                    onClick={() => toggleTag(preset.label)}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors",
                      isSelected ? "bg-surface-hover" : "hover:bg-surface-hover"
                    )}
                  >
                    <span className={cn("px-2 py-0.5 rounded-full border", preset.color)}>
                      {preset.label}
                    </span>
                    {isSelected && <X className="h-3 w-3 text-text-muted" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
