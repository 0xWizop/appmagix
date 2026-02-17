"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/toast-context";
import { ToolCard } from "./tool-card";
import { Webhook, Copy, RefreshCw, Trash2 } from "lucide-react";

interface WebhookRequest {
  id: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: Date;
}

export function WebhookTester() {
  const toast = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<WebhookRequest[]>([]);
  const [selected, setSelected] = useState<WebhookRequest | null>(null);

  const createSession = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/webhooks/session", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create session");
      setSessionId(data.sessionId);
      setRequests([]);
      setSelected(null);
      toast.success("Endpoint created");
    } catch (e) {
      toast.error("Failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchRequests = useCallback(async () => {
    if (!sessionId) return;
    const res = await fetch(`/api/webhooks/requests?sessionId=${sessionId}`);
    const data = await res.json();
    if (res.ok && data.requests) {
      setRequests(data.requests.map((r: { id: string; method: string; headers: Record<string, string>; body: string; timestamp: string }) => ({
        ...r,
        timestamp: new Date(r.timestamp),
      })));
    }
  }, [sessionId]);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const webhookUrl = sessionId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/incoming/${sessionId}`
    : "";

  const copyUrl = () => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    toast.success("URL copied");
  };

  return (
    <ToolCard title="Webhook Tester" icon={Webhook}>
        {!sessionId ? (
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">
              Create a unique endpoint to receive webhooks and inspect incoming requests.
            </p>
            <Button onClick={createSession} disabled={loading} className="w-full">
              {loading ? "Creating..." : "Generate endpoint"}
            </Button>
          </div>
        ) : (
          <>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Webhook URL</label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={webhookUrl}
                  className="font-mono text-xs"
                />
                <Button variant="outline" size="icon" onClick={copyUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Accepts GET, POST, PUT, PATCH, DELETE</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {requests.length} request{requests.length !== 1 ? "s" : ""} received
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={fetchRequests}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={createSession}>
                  <Trash2 className="h-4 w-4" />
                  New
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {requests.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">
                  Send a request to the URL above to see it here
                </p>
              ) : (
                requests.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelected(selected?.id === r.id ? null : r)}
                    className={`w-full text-left p-3 rounded border border-zinc-600 hover:border-zinc-500 transition-colors ${
                      selected?.id === r.id ? "border-zinc-500 bg-zinc-600" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-cyan-400">{r.method}</span>
                      <span className="text-xs text-zinc-500">
                        {r.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {selected && (
              <div className="rounded border border-zinc-600 p-3 space-y-2">
                <div>
                  <span className="text-xs text-zinc-500">Headers</span>
                  <pre className="mt-1 p-2 rounded bg-zinc-800 text-[10px] font-mono overflow-x-auto max-h-20 overflow-y-auto">
                    {Object.entries(selected.headers)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join("\n") || "(none)"}
                  </pre>
                </div>
                <div>
                  <span className="text-xs text-zinc-500">Body</span>
                  <pre className="mt-1 p-2 rounded bg-zinc-800 text-[10px] font-mono overflow-x-auto max-h-20 overflow-y-auto whitespace-pre-wrap break-words">
                    {selected.body || "(empty)"}
                  </pre>
                </div>
              </div>
            )}
          </>
        )}
    </ToolCard>
  );
}
