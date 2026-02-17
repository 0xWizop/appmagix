"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/lib/toast-context";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const PROJECT_TYPES = [
  { value: "shopify", label: "Shopify Build" },
  { value: "custom-shopify", label: "Custom Shopify Build" },
  { value: "custom-website", label: "Custom Website" },
  { value: "app-build", label: "App Build" },
  { value: "redesign", label: "Store Redesign" },
  { value: "migration", label: "Platform Migration" },
  { value: "other", label: "Other" },
];

const BUDGET_RANGES = [
  { value: "under-5k", label: "Under $5,000" },
  { value: "5k-10k", label: "$5,000 - $10,000" },
  { value: "10k-25k", label: "$10,000 - $25,000" },
  { value: "25k-50k", label: "$25,000 - $50,000" },
  { value: "50k+", label: "$50,000+" },
  { value: "not-sure", label: "Not sure yet" },
];

const STEPS = [
  { id: 1, title: "Project Type", description: "What do you need?" },
  { id: 2, title: "Business", description: "Tell us about your business" },
  { id: 3, title: "Goals & Scope", description: "What are you building?" },
  { id: 4, title: "Budget & Timeline", description: "Practical details" },
  { id: 5, title: "Contact", description: "How to reach you" },
];

export interface IntakeFormData {
  projectType: string;
  businessName?: string;
  industry?: string;
  goals?: string;
  scope?: string;
  features?: string;
  budget?: string;
  timeline?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
}

interface IntakeFormProps {
  defaultContactName?: string;
  defaultContactEmail?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

export function IntakeForm({
  defaultContactName = "",
  defaultContactEmail = "",
  onSuccess,
  compact = false,
}: IntakeFormProps) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<IntakeFormData>({
    projectType: "",
    businessName: "",
    industry: "",
    goals: "",
    scope: "",
    features: "",
    budget: "",
    timeline: "",
    contactName: defaultContactName,
    contactEmail: defaultContactEmail,
    contactPhone: "",
  });

  const update = (key: keyof IntakeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.projectType;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return !!formData.contactName && !!formData.contactEmail;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/intakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setSubmitted(true);
      toast.success("Intake submitted! We'll review and get back to you via email.");
      onSuccess?.();
    } catch (e) {
      toast.error("Submission failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-brand-green">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="h-16 w-16 rounded-full bg-brand-green-dark flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-medium mb-2">Thank you!</h3>
          <p className="text-text-secondary text-sm max-w-sm mx-auto">
            We&apos;ve received your project details. We&apos;ll review and respond within 24 hours via email.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                step >= s.id ? "bg-brand-green" : "bg-surface"
              )}
            />
          ))}
        </div>
        <CardTitle className="text-lg">{STEPS[step - 1].title}</CardTitle>
        <CardDescription>{STEPS[step - 1].description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Type</Label>
              <Select value={formData.projectType} onValueChange={(v) => update("projectType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input
                placeholder="Acme Inc"
                value={formData.businessName}
                onChange={(e) => update("businessName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input
                placeholder="e.g. Fashion, Food & Beverage"
                value={formData.industry}
                onChange={(e) => update("industry", e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Goals</Label>
              <Textarea
                placeholder="What do you want to achieve with this project?"
                value={formData.goals}
                onChange={(e) => update("goals", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Scope / Features</Label>
              <Textarea
                placeholder="Key features, integrations, or requirements"
                value={formData.features}
                onChange={(e) => update("features", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Budget Range</Label>
              <Select value={formData.budget} onValueChange={(v) => update("budget", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timeline</Label>
              <Input
                placeholder="e.g. 4 weeks, ASAP"
                value={formData.timeline}
                onChange={(e) => update("timeline", e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Name *</Label>
              <Input
                placeholder="John Doe"
                value={formData.contactName}
                onChange={(e) => update("contactName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.contactEmail}
                onChange={(e) => update("contactEmail", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Phone (optional)</Label>
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.contactPhone}
                onChange={(e) => update("contactPhone", e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : null}
          <div className="flex-1" />
          {step < 5 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading || !canProceed()}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Submit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
