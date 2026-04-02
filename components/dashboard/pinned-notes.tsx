"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, X, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  text: string;
  color: string;
  createdAt: string;
}

const NOTE_COLORS = [
  { key: "yellow", bg: "bg-yellow-400/10 border-yellow-400/30", text: "text-yellow-100" },
  { key: "green",  bg: "bg-brand-green/10 border-brand-green/30", text: "text-green-100" },
  { key: "pink",   bg: "bg-pink-500/10 border-pink-500/30", text: "text-pink-100" },
  { key: "blue",   bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-100" },
];

function getColorClass(key: string) {
  return NOTE_COLORS.find((c) => c.key === key) ?? NOTE_COLORS[0];
}

export function PinnedNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [newColor, setNewColor] = useState("yellow");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/user/preferences", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setNotes(data.preferences?.pinnedNotes ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveNotes = useCallback((updated: Note[]) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pinnedNotes: updated }),
      }).catch(() => {});
    }, 600);
  }, []);

  const addNote = () => {
    if (!newText.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      text: newText.trim(),
      color: newColor,
      createdAt: new Date().toISOString(),
    };
    const updated = [note, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setNewText("");
    setAdding(false);
  };

  const removeNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium flex items-center gap-2 text-text-secondary">
          <StickyNote className="h-4 w-4" />
          Pinned Notes
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setAdding((v) => !v)}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>

      {adding && (
        <div className="border border-border rounded-xl p-4 bg-surface space-y-3 animate-in slide-in-from-top-2 duration-200">
          <textarea
            autoFocus
            placeholder="Write a note..."
            className="w-full bg-transparent resize-none text-sm focus:outline-none min-h-[72px]"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote();
              if (e.key === "Escape") setAdding(false);
            }}
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setNewColor(c.key)}
                  className={cn(
                    "h-5 w-5 rounded-full border-2 transition-transform",
                    c.key === "yellow" && "bg-yellow-400",
                    c.key === "green" && "bg-brand-green",
                    c.key === "pink" && "bg-pink-500",
                    c.key === "blue" && "bg-blue-500",
                    newColor === c.key ? "scale-125 border-white" : "border-transparent scale-100"
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAdding(false)}>Cancel</Button>
              <Button size="sm" className="h-7 text-xs" onClick={addNote} disabled={!newText.trim()}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-surface animate-pulse" />)}
        </div>
      ) : notes.length === 0 && !adding ? (
        <p className="text-xs text-text-muted py-2">No notes yet. Click Add to create one.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {notes.map((note) => {
            const c = getColorClass(note.color);
            return (
              <div
                key={note.id}
                className={cn("relative rounded-xl border p-4 group min-h-[80px]", c.bg)}
              >
                <p className={cn("text-sm whitespace-pre-wrap break-words pr-6", c.text)}>{note.text}</p>
                <button
                  type="button"
                  onClick={() => removeNote(note.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
