"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Code2, Play, RefreshCw, Copy, Check } from "lucide-react";

interface InteractivePreviewProps {
  title: string;
  description?: string;
  defaultCode?: string;
  showCode?: boolean;
  component: React.ReactNode;
  controls?: {
    name: string;
    type: "select" | "toggle" | "text";
    options?: string[];
    value: any;
    onChange: (val: any) => void;
  }[];
}

export function InteractivePreview({ 
  title, 
  description, 
  defaultCode = "", 
  showCode = false,
  component,
  controls 
}: InteractivePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

  const copyCode = () => {
    navigator.clipboard.writeText(defaultCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="my-8 overflow-hidden border-border bg-surface">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="border-b border-border bg-background/50 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-medium">{title}</CardTitle>
              {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
            </div>
            {showCode && (
              <TabsList className="grid w-auto grid-cols-2 h-9 p-1 bg-surface-hover">
                <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                <TabsTrigger value="code" className="text-xs">Code</TabsTrigger>
              </TabsList>
            )}
          </div>
        </CardHeader>
        
        <TabsContent value="preview" className="m-0 border-0 focus-visible:ring-0">
          <div className="flex flex-col lg:flex-row min-h-[400px]">
            {/* Component Demo Area */}
            <div className="flex-1 flex items-center justify-center p-8 bg-dot-pattern bg-[length:24px_24px]">
              <div className="w-full max-w-md mx-auto transform transition-all duration-300">
                {component}
              </div>
            </div>
            
            {/* Sidebar Controls */}
            {controls && controls.length > 0 && (
              <div className="w-full lg:w-72 border-l border-border bg-background/30 p-6 space-y-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  <Play className="w-3 h-3" />
                  Live Controls
                </div>
                {controls.map((control) => (
                  <div key={control.name} className="space-y-3">
                    <label className="text-sm font-medium text-text-secondary">{control.name}</label>
                    {control.type === "select" && (
                      <div className="flex flex-wrap gap-2">
                        {control.options?.map((opt) => (
                          <Button
                            key={opt}
                            variant={control.value === opt ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => control.onChange(opt)}
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                    )}
                    {control.type === "toggle" && (
                      <Button
                        variant={control.value ? "default" : "outline"}
                        size="sm"
                        className="w-full text-xs h-8"
                        onClick={() => control.onChange(!control.value)}
                      >
                        {control.value ? "On" : "Off"}
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs text-text-muted hover:text-white mt-4"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Reset Preview
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="code" className="m-0 border-0 focus-visible:ring-0">
          <div className="relative group">
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-4 top-4 h-8 w-8 text-text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={copyCode}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <pre className="p-6 bg-zinc-950 text-brand-green/90 text-sm font-mono overflow-auto max-h-[400px]">
              <code>{defaultCode}</code>
            </pre>
          </div>
        </TabsContent>
      </Card>
    </Tabs>
  );
}
