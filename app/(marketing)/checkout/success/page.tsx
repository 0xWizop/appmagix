"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div
        className={`text-center max-w-md w-full transition-all duration-700 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Animated icon */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full bg-brand-green/20 animate-ping" />
          <div className="relative h-24 w-24 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-brand-green" strokeWidth={1.5} />
          </div>
        </div>

        {/* Wordmark */}
        <p className="text-sm font-semibold tracking-widest text-text-muted uppercase mb-6">
          merchant<span className="text-brand-green">magix</span>
        </p>

        <h1 className="text-3xl sm:text-4xl font-semibold mb-4 text-white">
          Payment confirmed!
        </h1>
        <p className="text-text-secondary text-base mb-2">
          Thank you for your purchase. We&apos;ve received your payment and your project is now underway.
        </p>
        <p className="text-text-muted text-sm mb-10">
          You&apos;ll receive a confirmation email shortly. Keep an eye on your dashboard for project updates.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard/web2/billing">
              View Invoices
            </Link>
          </Button>
        </div>

        {/* Confetti-like sparkle */}
        <div className="mt-16 flex justify-center gap-8 text-brand-green/30">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <Sparkles className="h-4 w-4 animate-pulse delay-150" />
          <Sparkles className="h-5 w-5 animate-pulse delay-300" />
        </div>
      </div>
    </div>
  );
}
