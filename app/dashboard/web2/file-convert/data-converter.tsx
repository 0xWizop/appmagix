"use client";

import { useState } from "react";
import yaml from "js-yaml";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast-context";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Copy, Check } from "lucide-react";

type ConvertType =
  | "json-yaml"
  | "yaml-json"
  | "csv-json"
  | "json-csv"
  | "json-minify"
  | "json-pretty";

function csvToJson(csv: string): string {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return "[]";
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return headers.reduce((obj, h, i) => {
      obj[h] = values[i] ?? "";
      return obj;
    }, {} as Record<string, string>);
  });
  return JSON.stringify(rows, null, 2);
}

function jsonToCsv(jsonStr: string): string {
  try {
    const data = JSON.parse(jsonStr);
    const arr = Array.isArray(data) ? data : [data];
    if (arr.length === 0) return "";
    const headers = Object.keys(arr[0] as object);
    const lines = [headers.join(",")];
    arr.forEach((row: Record<string, unknown>) => {
      lines.push(headers.map((h) => String(row[h] ?? "")).join(","));
    });
    return lines.join("\n");
  } catch {
    return "Invalid JSON";
  }
}

function jsonToYaml(jsonStr: string): string {
  try {
    const obj = JSON.parse(jsonStr);
    return yaml.dump(obj, { indent: 2 });
  } catch {
    return "Invalid JSON";
  }
}

function yamlToJson(yamlStr: string): string {
  try {
    const obj = yaml.load(yamlStr);
    return JSON.stringify(obj, null, 2);
  } catch {
    return "Invalid YAML";
  }
}

const conversions: { value: ConvertType; label: string }[] = [
  { value: "json-yaml", label: "JSON → YAML" },
  { value: "yaml-json", label: "YAML → JSON" },
  { value: "csv-json", label: "CSV → JSON" },
  { value: "json-csv", label: "JSON → CSV" },
  { value: "json-minify", label: "JSON Minify" },
  { value: "json-pretty", label: "JSON Pretty" },
];

export function DataConverter() {
  const toast = useToast();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [convertType, setConvertType] = useState<ConvertType>("json-yaml");
  const [copied, setCopied] = useState(false);

  const convert = () => {
    try {
      switch (convertType) {
        case "json-yaml":
          setOutput(jsonToYaml(input));
          break;
        case "yaml-json":
          setOutput(yamlToJson(input));
          break;
        case "csv-json":
          setOutput(csvToJson(input));
          break;
        case "json-csv":
          setOutput(jsonToCsv(input));
          break;
        case "json-minify":
          setOutput(JSON.stringify(JSON.parse(input)));
          break;
        case "json-pretty":
          setOutput(JSON.stringify(JSON.parse(input), null, 2));
          break;
        default:
          setOutput("");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid input";
      setOutput(`Error: ${msg}`);
      toast.error("Conversion failed", msg);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Conversion type bar */}
      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={convertType}
          onValueChange={(v) => setConvertType(v as ConvertType)}
        >
          <SelectTrigger className="w-[200px] text-sm h-9 border-border/50 bg-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {conversions.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={convert}
          size="sm"
          className="h-9 bg-brand-green text-black hover:bg-brand-green/90"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Convert
        </Button>
      </div>

      {/* Panels - equal width */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="relative rounded-lg border border-border/50 bg-surface overflow-hidden min-w-0 flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-surface shrink-0">
            <span className="text-xs text-text-muted">Input</span>
          </div>
          <Textarea
            placeholder="Paste content..."
            className="min-h-[280px] text-sm resize-none border-0 rounded-none focus-visible:ring-0 bg-surface placeholder:text-text-muted/50 flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div className="relative rounded-lg border border-border/50 bg-surface overflow-hidden min-w-0 flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-surface shrink-0">
            <span className="text-xs text-text-muted">Output</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyOutput}
              disabled={!output}
              className="h-7 text-xs shrink-0"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 mr-1 text-brand-green" />
              ) : (
                <Copy className="h-3.5 w-3.5 mr-1" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Textarea
            readOnly
            className="min-h-[280px] text-sm resize-none border-0 rounded-none bg-surface placeholder:text-text-muted/50 flex-1"
            value={output}
            placeholder="Result..."
          />
        </div>
      </div>
    </div>
  );
}
