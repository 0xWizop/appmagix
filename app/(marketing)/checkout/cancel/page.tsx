"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { XCircle, ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
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
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="h-24 w-24 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-amber-400" strokeWidth={1.5} />
          </div>
        </div>

        <p className="text-sm font-semibold tracking-widest text-text-muted uppercase mb-6">
          merchant<span className="text-brand-green">magix</span>
        </p>

        <h1 className="text-3xl sm:text-4xl font-semibold mb-4 text-white">
          No worries!
        </h1>
        <p className="text-text-secondary text-base mb-2">
          Your payment was cancelled — nothing was charged.
        </p>
        <p className="text-text-muted text-sm mb-10">
          If you had trouble completing the payment or have questions about pricing, we&apos;re happy to help.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href="/pricing">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pricing
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Us
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
