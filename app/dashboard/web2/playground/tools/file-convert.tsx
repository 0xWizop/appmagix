"use client";

import { useState } from "react";
import yaml from "js-yaml";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolCard } from "./tool-card";
import { FileCode, ArrowRight, Copy, Check } from "lucide-react";

type ConvertType = "json-yaml" | "yaml-json" | "csv-json" | "json-csv" | "json-minify" | "json-pretty";

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

export function FileConvert() {
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
      setOutput(`Error: ${e instanceof Error ? e.message : "Invalid input"}`);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const conversions: { value: ConvertType; label: string }[] = [
    { value: "json-yaml", label: "JSON → YAML" },
    { value: "yaml-json", label: "YAML → JSON" },
    { value: "csv-json", label: "CSV → JSON" },
    { value: "json-csv", label: "JSON → CSV" },
    { value: "json-minify", label: "JSON Minify" },
    { value: "json-pretty", label: "JSON Pretty" },
  ];

  return (
    <ToolCard title="JSON / YAML / CSV" icon={FileCode}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Conversion type</Label>
          <Select value={convertType} onValueChange={(v) => setConvertType(v as ConvertType)}>
            <SelectTrigger>
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
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label>Input</Label>
            <Textarea
              placeholder="Paste your content here..."
              className="min-h-[200px] font-mono text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Output</Label>
              <Button variant="ghost" size="sm" onClick={copyOutput} disabled={!output}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy
              </Button>
            </div>
            <Textarea
              readOnly
              className="min-h-[200px] font-mono text-sm bg-surface"
              value={output}
              placeholder="Result will appear here..."
            />
          </div>
        </div>

        <Button onClick={convert} className="w-full sm:w-auto">
          <ArrowRight className="mr-2 h-4 w-4" />
          Convert
        </Button>
      </div>
    </ToolCard>
  );
}
