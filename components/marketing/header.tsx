"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useFirebaseAuth } from "@/lib/firebase-auth-context";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "/pricing" },
  { name: "Work", href: "/work" },
  { name: "Docs", href: "/docs" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const { user } = useFirebaseAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b border-border transition-all duration-200",
        scrolled ? "bg-background/90 backdrop-blur-xl shadow-lg shadow-black/5" : "bg-background/80 backdrop-blur-xl"
      )}
    >
      <nav className="container-width section-padding !py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <span className="text-2xl font-brand italic tracking-tight text-text-primary transition-colors group-hover:opacity-90">
            merchant<span className="text-brand-green">magix</span>.
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative text-sm text-text-secondary hover:text-text-primary transition-colors py-1 after:absolute after:left-0 after:bottom-0 after:h-px after:w-0 after:bg-brand-green after:transition-[width] after:duration-200 hover:after:w-full"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          {!user && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors active:scale-95"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <div
        className={cn(
          "md:hidden bg-surface border-b border-border overflow-hidden transition-all duration-200 ease-out",
          mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container-width px-4 py-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block py-3 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg px-3 -mx-3 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-border space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
            </Button>
            {!user && (
              <>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
