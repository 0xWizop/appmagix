"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/lib/toast-context";
import { Send, Trash2, Plus, Loader2 } from "lucide-react";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export default function ApiBuilderPage() {
  const toast = useToast();
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([
    { key: "Content-Type", value: "application/json" },
  ]);
  const [body, setBody] = useState("{}");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
  } | null>(null);

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (i: number) => {
    setHeaders(headers.filter((_, idx) => idx !== i));
  };

  const updateHeader = (i: number, field: "key" | "value", val: string) => {
    const next = [...headers];
    next[i] = { ...next[i], [field]: val };
    setHeaders(next);
  };

  const sendRequest = async () => {
    if (!url.trim()) {
      toast.error("Enter a URL");
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      toast.error("Invalid URL");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const headerObj: Record<string, string> = {};
      headers.forEach(({ key, value }) => {
        if (key.trim()) headerObj[key.trim()] = value.trim();
      });

      let bodyParsed: string | undefined;
      if (method !== "GET" && body.trim()) {
        try {
          JSON.parse(body);
          bodyParsed = body;
        } catch {
          bodyParsed = body;
        }
      }

      const res = await fetch("/api/proxy-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          url: parsedUrl.toString(),
          headers: headerObj,
          body: bodyParsed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      setResponse({
        status: data.status,
        statusText: data.statusText,
        headers: data.headers ?? {},
        body: data.body ?? "",
      });
      toast.success("Request sent");
    } catch (e) {
      toast.error("Request failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-green/20 border border-brand-green/50 mb-4">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-green" />
          <span className="text-xs font-medium text-brand-green uppercase tracking-wider">
            API
          </span>
        </div>
        <h1 className="text-3xl font-medium tracking-tight">API Request Builder</h1>
        <p className="text-text-secondary mt-2 text-sm max-w-xl">
          Send HTTP requests and inspect responses. Supports CORS for testing APIs.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
            <CardDescription>Configure and send HTTP requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="https://api.example.com/endpoint"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Headers</Label>
                <Button variant="ghost" size="sm" onClick={addHeader}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {headers.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Header"
                      value={h.key}
                      onChange={(e) => updateHeader(i, "key", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value"
                      value={h.value}
                      onChange={(e) => updateHeader(i, "value", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHeader(i)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-text-muted" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {method !== "GET" && (
              <div>
                <Label>Body (JSON)</Label>
                <textarea
                  className="mt-2 w-full min-h-[120px] rounded-md border border-border bg-surface px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
                  placeholder='{"key": "value"}'
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
            )}

            <Button onClick={sendRequest} disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Request
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>Status, headers, and body</CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      response.status >= 200 && response.status < 300
                        ? "bg-green-500/20 text-green-600 dark:text-green-400"
                        : response.status >= 400
                        ? "bg-red-500/20 text-red-600 dark:text-red-400"
                        : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {response.status} {response.statusText}
                  </span>
                </div>
                <div>
                  <Label className="text-xs">Headers</Label>
                  <pre className="mt-1 p-3 rounded-md bg-surface text-xs font-mono overflow-x-auto max-h-24 overflow-y-auto">
                    {Object.entries(response.headers)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join("\n") || "(none)"}
                  </pre>
                </div>
                <div>
                  <Label className="text-xs">Body</Label>
                  <pre className="mt-1 p-3 rounded-md bg-surface text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap break-words">
                    {response.body || "(empty)"}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-12">
                Send a request to see the response
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
