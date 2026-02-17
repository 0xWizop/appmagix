"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Project = {
  id: number;
  title: string;
  category: string;
  tags: string[];
  results: string;
};

type View = "home" | "shop" | "product" | "about" | "contact";

type Product = { name: string; price: string; color: string };

const themes = {
  1: {
    name: "Luxe Botanics",
    bg: "bg-[#faf9f6]",
    navBg: "bg-white/95 border-b border-stone-200/80",
    logo: "Luxe",
    navLinks: [
      { label: "Skincare", view: "shop" as View },
      { label: "Body", view: "shop" as View },
      { label: "About", view: "about" as View },
    ],
    heroHeadline: "Natural ingredients.",
    heroSub: "Visible results. Dermatologist-approved formulas for every skin type.",
    cta: "Shop the collection",
    featuredTitle: "Best sellers",
    featuredSub: "Our most loved products — shop now",
    aboutTitle: "Our story",
    aboutText: "Born from a love of clean, effective skincare. We source the finest natural ingredients and partner with leading labs to create formulas that deliver.",
    products: [
      { name: "Daily Cleanser", price: "$42", color: "bg-amber-100" },
      { name: "Vitamin C Serum", price: "$68", color: "bg-rose-50" },
      { name: "Night Cream", price: "$54", color: "bg-stone-200/60" },
      { name: "Eye Cream", price: "$48", color: "bg-amber-50" },
      { name: "Face Oil", price: "$56", color: "bg-yellow-100/80" },
      { name: "Sunscreen", price: "$38", color: "bg-orange-50" },
    ],
    btn: "bg-stone-800 text-white hover:bg-stone-700",
    text: "text-stone-700",
    textMuted: "text-stone-500",
    accent: "text-stone-900",
    footerLinks: ["Contact", "FAQ", "Shipping"],
  },
  2: {
    name: "Urban Threads",
    bg: "bg-black",
    navBg: "bg-black border-b border-zinc-800",
    logo: "URBAN",
    navLinks: [
      { label: "New", view: "shop" as View },
      { label: "Tops", view: "shop" as View },
      { label: "About", view: "about" as View },
    ],
    heroHeadline: "Drop 02.",
    heroSub: "Limited run. Live now. New collection drops every Friday at 12pm EST.",
    cta: "Shop the drop",
    featuredTitle: "Just dropped",
    featuredSub: "Latest arrivals — limited stock",
    aboutTitle: "Who we are",
    aboutText: "Streetwear for the next generation. Independent brand. Limited runs. No restocks.",
    products: [
      { name: "Oversized Hoodie", price: "$120", color: "bg-zinc-800" },
      { name: "Graphic Tee", price: "$48", color: "bg-zinc-700" },
      { name: "Cap", price: "$36", color: "bg-zinc-800" },
      { name: "Cargo Pants", price: "$98", color: "bg-zinc-750" },
      { name: "Windbreaker", price: "$140", color: "bg-zinc-700" },
      { name: "Beanie", price: "$28", color: "bg-zinc-800" },
    ],
    btn: "bg-white text-black hover:bg-zinc-200",
    text: "text-zinc-300",
    textMuted: "text-zinc-500",
    accent: "text-white",
    footerLinks: ["Contact", "Size guide", "Returns"],
  },
  3: {
    name: "FitGear Pro",
    bg: "bg-slate-50",
    navBg: "bg-white border-b border-slate-200",
    logo: "FITGEAR",
    navLinks: [
      { label: "Equipment", view: "shop" as View },
      { label: "Bundles", view: "shop" as View },
      { label: "About", view: "about" as View },
    ],
    heroHeadline: "Build your home gym.",
    heroSub: "Pro-grade gear. No gym required. Free shipping on orders over $200.",
    cta: "View equipment",
    featuredTitle: "Best for home",
    featuredSub: "Equipment that fits your space",
    aboutTitle: "Our mission",
    aboutText: "We design and engineer equipment for serious lifters. Same quality as commercial gyms, built for your garage or basement.",
    products: [
      { name: "Squat Rack", price: "$449", color: "bg-slate-200" },
      { name: "Dumbbell Set", price: "$299", color: "bg-slate-300" },
      { name: "Adjustable Bench", price: "$189", color: "bg-slate-200" },
      { name: "Barbell", price: "$129", color: "bg-slate-300" },
      { name: "Kettlebell Set", price: "$159", color: "bg-slate-200" },
      { name: "Resistance Bands", price: "$39", color: "bg-slate-100" },
    ],
    btn: "bg-red-600 text-white hover:bg-red-700",
    text: "text-slate-600",
    textMuted: "text-slate-400",
    accent: "text-slate-900",
    footerLinks: ["Contact", "Warranty", "Shipping"],
  },
  4: {
    name: "Artisan Coffee",
    bg: "bg-[#2c1810]",
    navBg: "bg-[#1a0f0a] border-b border-amber-900/50",
    logo: "Artisan",
    navLinks: [
      { label: "Coffee", view: "shop" as View },
      { label: "Subscribe", view: "shop" as View },
      { label: "Story", view: "about" as View },
    ],
    heroHeadline: "Fresh roasted.",
    heroSub: "Delivered to your door. Subscribe and save 15% on every order.",
    cta: "Start subscription",
    featuredTitle: "Roaster's choice",
    featuredSub: "This month's featured blends",
    aboutTitle: "From our roastery",
    aboutText: "Small-batch roasted in Brooklyn. We source directly from farms and roast to order for maximum freshness.",
    products: [
      { name: "House Blend", price: "$18", color: "bg-amber-900/40" },
      { name: "Single Origin", price: "$22", color: "bg-amber-800/30" },
      { name: "Decaf", price: "$18", color: "bg-amber-900/40" },
      { name: "Espresso", price: "$20", color: "bg-amber-950/50" },
      { name: "Cold Brew", price: "$16", color: "bg-amber-900/30" },
      { name: "Subscription", price: "Save 15%", color: "bg-amber-700/30" },
    ],
    btn: "bg-amber-600 text-white hover:bg-amber-500",
    text: "text-amber-100/90",
    textMuted: "text-amber-200/50",
    accent: "text-amber-50",
    footerLinks: ["Contact", "FAQ", "Shipping"],
  },
  5: {
    name: "Pet Paradise",
    bg: "bg-emerald-50/80",
    navBg: "bg-white border-b border-emerald-200/80",
    logo: "Pet Paradise",
    navLinks: [
      { label: "Shop", view: "shop" as View },
      { label: "Rewards", view: "about" as View },
      { label: "Care Guide", view: "about" as View },
    ],
    heroHeadline: "Happy pets, happy you.",
    heroSub: "Everything they need. All in one place. Join rewards for 10% off your first order.",
    cta: "Shop by pet",
    featuredTitle: "Pet parent favorites",
    featuredSub: "Top picks from our community",
    aboutTitle: "Rewards program",
    aboutText: "Earn points on every purchase. Redeem for treats, toys, and more. Free to join.",
    products: [
      { name: "Premium Food", price: "$34", color: "bg-emerald-100" },
      { name: "Chew Toys", price: "$14", color: "bg-amber-100" },
      { name: "Cozy Bed", price: "$49", color: "bg-emerald-200/60" },
      { name: "Treats", price: "$9", color: "bg-amber-50" },
      { name: "Grooming Kit", price: "$24", color: "bg-emerald-100" },
      { name: "Carrier", price: "$42", color: "bg-emerald-200/50" },
    ],
    btn: "bg-emerald-600 text-white hover:bg-emerald-700",
    text: "text-emerald-800",
    textMuted: "text-emerald-600",
    accent: "text-emerald-900",
    footerLinks: ["Contact", "FAQ", "Shipping"],
  },
  6: {
    name: "Modern Home",
    bg: "bg-white",
    navBg: "bg-white border-b border-neutral-200",
    logo: "Modern Home",
    navLinks: [
      { label: "Furniture", view: "shop" as View },
      { label: "Lighting", view: "shop" as View },
      { label: "About", view: "about" as View },
    ],
    heroHeadline: "Design for living.",
    heroSub: "Curated pieces. Timeless style. Free design consultation on orders over $1,000.",
    cta: "Explore collection",
    featuredTitle: "New this season",
    featuredSub: "Handpicked for your space",
    aboutTitle: "Our approach",
    aboutText: "We work with independent makers and brands to bring you furniture and lighting that lasts decades, not trends.",
    products: [
      { name: "Sectional Sofa", price: "$1,890", color: "bg-neutral-100" },
      { name: "Oak Table", price: "$620", color: "bg-neutral-200" },
      { name: "Floor Lamp", price: "$285", color: "bg-neutral-100" },
      { name: "Dining Chairs", price: "$380", color: "bg-neutral-200" },
      { name: "Sideboard", price: "$720", color: "bg-neutral-100" },
      { name: "Pendant", price: "$195", color: "bg-neutral-50" },
    ],
    btn: "bg-neutral-900 text-white hover:bg-neutral-800",
    text: "text-neutral-600",
    textMuted: "text-neutral-400",
    accent: "text-neutral-900",
    footerLinks: ["Contact", "Delivery", "Returns"],
  },
} as const;

export function MiniSitePreview({ project }: { project: Project }) {
  const [view, setView] = useState<View>("home");
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [hoverProduct, setHoverProduct] = useState<number | null>(null);
  const [footerLink, setFooterLink] = useState<string | null>(null);
  const t = themes[project.id as keyof typeof themes] ?? themes[1];
  const products = t.products as unknown as Product[];

  const go = (v: View) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setView(v);
    setFooterLink(null);
  };

  const openProduct = (i: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(i);
    setView("product");
    setFooterLink(null);
  };

  return (
    <div
      className={cn(
        "w-full rounded-xl overflow-hidden border border-border",
        "transition-all duration-200 hover:border-brand-green/40",
        "flex flex-col bg-surface"
      )}
      style={{ minHeight: "320px", maxHeight: "380px" }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-neutral-900/95 border-b border-neutral-700 shrink-0">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-[9px] text-neutral-500 font-mono">
            {project.title.toLowerCase().replace(/\s/g, "-")}.com
          </span>
        </div>
      </div>

      {/* Site content */}
      <div
        className={cn("flex-1 flex flex-col min-h-0 overflow-hidden", t.bg)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nav */}
        <nav
          className={cn(
            "flex items-center justify-between px-3 py-2 shrink-0",
            t.navBg
          )}
        >
          <button
            type="button"
            onClick={go("home")}
            className={cn(
              "font-medium text-[11px] tracking-tight hover:opacity-80 cursor-pointer",
              t.accent
            )}
          >
            {t.logo}
          </button>
          <div className="flex gap-3">
            {t.navLinks.map(({ label, view: v }) => (
              <button
                key={label}
                type="button"
                onClick={go(v)}
                className={cn(
                  "text-[9px] font-medium hover:opacity-80 transition-opacity cursor-pointer",
                  t.text,
                  view === v && "underline"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={go("shop")}
            className={cn(
              "text-[9px] font-medium cursor-pointer",
              t.text
            )}
          >
            Cart (0)
          </button>
        </nav>

        {/* Scrollable main content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-3">
          {/* Footer link feedback (FAQ / Shipping) */}
          {footerLink && footerLink !== "Contact" && view === "home" && (
            <div
              className={cn(
                "mb-2 p-2 rounded text-[9px] border",
                project.id === 2 ? "bg-zinc-800 border-zinc-600 text-zinc-300" : "bg-white/80 border-black/10",
                t.textMuted
              )}
            >
              {footerLink}: See our help center for details.
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFooterLink(null); }}
                className="ml-1 underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
          {view === "home" && (
            <>
              {/* Layout 1: Luxe — editorial, centered, lots of whitespace */}
              {project.id === 1 && (
                <div className="space-y-4 pb-2 text-center">
                  <div className="py-3">
                    <h2 className={cn("font-medium text-[14px] tracking-wide mb-1", t.accent)}>
                      {t.heroHeadline}
                    </h2>
                    <p className={cn("text-[9px] max-w-[90%] mx-auto mb-3", t.textMuted)}>
                      {t.heroSub}
                    </p>
                    <button type="button" onClick={go("shop")} className={cn("px-3 py-1.5 rounded-sm text-[9px] font-medium", t.btn)}>
                      {t.cta}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {products.slice(0, 3).map((prod, i) => (
                      <button key={prod.name} type="button" onClick={openProduct(i)} className="text-center">
                        <div className={cn("aspect-[3/4] rounded-sm mb-1", prod.color)} />
                        <p className={cn("text-[9px] font-medium", t.accent)}>{prod.name}</p>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={go("about")} className={cn("text-[8px] underline", t.textMuted)}>
                    Our story
                  </button>
                  <div className="pt-2 border-t border-stone-200/60 flex justify-center gap-4">
                    {(t.footerLinks as unknown as string[]).map((link) => (
                      <button key={link} type="button" onClick={(e) => { e.stopPropagation(); setFooterLink(link); if (link === "Contact") setView("contact"); }} className={cn("text-[8px] cursor-pointer", t.textMuted)}>{link}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Layout 2: Urban — lookbook grid, no hero, dense 2x3 grid */}
              {project.id === 2 && (
                <div className="space-y-2 pb-2">
                  <div className="grid grid-cols-2 gap-1">
                    {products.map((prod, i) => (
                      <button
                        key={prod.name}
                        type="button"
                        onClick={openProduct(i)}
                        className="relative aspect-square rounded-none overflow-hidden group"
                      >
                        <div className={cn("absolute inset-0", prod.color)} />
                        <span className={cn("absolute bottom-0 left-0 right-0 py-0.5 text-[8px] font-medium bg-black/60 text-white text-center opacity-0 group-hover:opacity-100 transition-opacity", t.accent)}>
                          {prod.name} — {prod.price}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={go("shop")} className={cn("w-full py-2 text-[10px] font-medium border border-zinc-600", t.btn)}>
                    {t.cta}
                  </button>
                  <div className="flex gap-4 pt-1">
                    {(t.footerLinks as unknown as string[]).map((link) => (
                      <button key={link} type="button" onClick={(e) => { e.stopPropagation(); setFooterLink(link); if (link === "Contact") setView("contact"); }} className={cn("text-[8px] cursor-pointer", t.textMuted)}>{link}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Layout 3: FitGear — category cards + products */}
              {project.id === 3 && (
                <div className="space-y-3 pb-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={go("shop")} className="text-left p-2.5 rounded-lg bg-white border-2 border-slate-200 hover:border-red-500/50 transition-colors">
                      <p className={cn("text-[10px] font-medium", t.accent)}>Equipment</p>
                      <p className={cn("text-[8px]", t.textMuted)}>Racks, weights, benches</p>
                    </button>
                    <button type="button" onClick={go("shop")} className="text-left p-2.5 rounded-lg bg-white border-2 border-slate-200 hover:border-red-500/50 transition-colors">
                      <p className={cn("text-[10px] font-medium", t.accent)}>Bundles</p>
                      <p className={cn("text-[8px]", t.textMuted)}>Save on sets</p>
                    </button>
                  </div>
                  <h2 className={cn("text-[11px] font-medium", t.accent)}>{t.heroHeadline}</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {products.slice(0, 3).map((prod, i) => (
                      <button key={prod.name} type="button" onClick={openProduct(i)}>
                        <div className={cn("aspect-square rounded-lg mb-1 border border-slate-200", prod.color)} />
                        <p className={cn("text-[9px] font-medium", t.accent)}>{prod.name}</p>
                        <p className={cn("text-[8px]", t.textMuted)}>{prod.price}</p>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={go("about")} className={cn("text-[9px] font-medium", t.accent)}>Programs →</button>
                  <div className="pt-2 border-t border-slate-200 flex gap-3">
                    {(t.footerLinks as unknown as string[]).map((link) => (
                      <button key={link} type="button" onClick={(e) => { e.stopPropagation(); setFooterLink(link); if (link === "Contact") setView("contact"); }} className={cn("text-[8px] cursor-pointer", t.textMuted)}>{link}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Layout 4: Artisan — subscription hero + one big featured product */}
              {project.id === 4 && (
                <div className="space-y-3 pb-2">
                  <div className="text-center py-2">
                    <h2 className={cn("text-[12px] font-medium", t.accent)}>{t.heroHeadline}</h2>
                    <p className={cn("text-[9px] mb-2", t.textMuted)}>{t.heroSub}</p>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-amber-600/80 text-[8px] font-medium text-amber-50">Subscribe & save 15%</span>
                  </div>
                  <button type="button" onClick={openProduct(0)} className="flex gap-2 w-full p-2 rounded-lg bg-amber-900/30 border border-amber-800/40 text-left">
                    <div className={cn("w-14 h-14 rounded-md shrink-0", products[0].color)} />
                    <div className="min-w-0">
                      <p className={cn("text-[11px] font-medium", t.accent)}>{products[0].name}</p>
                      <p className={cn("text-[9px]", t.textMuted)}>{products[0].price}</p>
                      <span className={cn("text-[8px] underline", t.accent)}>Start subscription</span>
                    </div>
                  </button>
                  <p className={cn("text-[9px] font-medium", t.accent)}>All coffee</p>
                  <div className="grid grid-cols-3 gap-1">
                    {products.slice(1, 4).map((prod, i) => (
                      <button key={prod.name} type="button" onClick={openProduct(i + 1)}>
                        <div className={cn("aspect-square rounded", prod.color)} />
                        <p className={cn("text-[8px] truncate", t.accent)}>{prod.name}</p>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                    {(t.footerLinks as unknown as string[]).map((link) => (
                      <button key={link} type="button" onClick={(e) => { e.stopPropagation(); setFooterLink(link); if (link === "Contact") setView("contact"); }} className={cn("text-[8px] cursor-pointer", t.textMuted)}>{link}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Layout 5: Pet — shop by pet pills + 2x3 product grid, rounded */}
              {project.id === 5 && (
                <div className="space-y-3 pb-2">
                  <p className={cn("text-[10px] font-medium", t.accent)}>Shop by pet</p>
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" onClick={go("shop")} className="px-3 py-1.5 rounded-full bg-emerald-200/80 text-[9px] font-medium text-emerald-900 hover:bg-emerald-300/80">
                      Dog
                    </button>
                    <button type="button" onClick={go("shop")} className="px-3 py-1.5 rounded-full bg-amber-200/80 text-[9px] font-medium text-amber-900 hover:bg-amber-300/80">
                      Cat
                    </button>
                    <button type="button" onClick={go("shop")} className="px-3 py-1.5 rounded-full bg-sky-200/80 text-[9px] font-medium text-sky-900 hover:bg-sky-300/80">
                      Small pet
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {products.map((prod, i) => (
                      <button key={prod.name} type="button" onClick={openProduct(i)} className="text-center">
                        <div className={cn("aspect-square rounded-2xl mb-1 overflow-hidden", prod.color)} />
                        <p className={cn("text-[9px] font-medium", t.accent)}>{prod.name}</p>
                        <p className={cn("text-[8px]", t.textMuted)}>{prod.price}</p>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={go("about")} className="w-full p-2.5 rounded-2xl bg-emerald-200/60 border border-emerald-300/60 text-center">
                    <p className={cn("text-[10px] font-medium", t.accent)}>Rewards program</p>
                    <p className={cn("text-[8px]", t.textMuted)}>Earn points on every order</p>
                  </button>
                  <div className="flex gap-3">
                    {(t.footerLinks as unknown as string[]).map((link) => (
                      <button key={link} type="button" onClick={(e) => { e.stopPropagation(); setFooterLink(link); if (link === "Contact") setView("contact"); }} className={cn("text-[8px] cursor-pointer", t.textMuted)}>{link}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Layout 6: Modern Home — minimal, one hero block + one featured product */}
              {project.id === 6 && (
                <div className="space-y-4 pb-2">
                  <div className="aspect-[2/1] rounded-md bg-neutral-100 flex items-center justify-center">
                    <p className={cn("text-[11px] font-medium tracking-wide", t.accent)}>{t.heroHeadline}</p>
                  </div>
                  <div className="space-y-2">
                    <p className={cn("text-[8px] uppercase tracking-widest", t.textMuted)}>Featured</p>
                    <button type="button" onClick={openProduct(0)} className="flex gap-3 w-full text-left">
                      <div className={cn("w-20 h-20 rounded-md shrink-0", products[0].color)} />
                      <div className="min-w-0">
                        <p className={cn("text-[12px] font-medium", t.accent)}>{products[0].name}</p>
                        <p className={cn("text-[10px]", t.textMuted)}>{products[0].price}</p>
                        <span className={cn("text-[9px] underline", t.accent)}>View</span>
                      </div>
                    </button>
                  </div>
                  <button type="button" onClick={go("shop")} className={cn("text-[9px] underline block", t.accent)}>
                    Explore collection
                  </button>
                  <div className="pt-3 border-t border-neutral-200 flex gap-4">
                    {(t.footerLinks as unknown as string[]).map((link) => (
                      <button key={link} type="button" onClick={(e) => { e.stopPropagation(); setFooterLink(link); if (link === "Contact") setView("contact"); }} className={cn("text-[8px] cursor-pointer", t.textMuted)}>{link}</button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {view === "shop" && (
            <div className="space-y-3 pb-2">
              {/* Urban: keep dense grid, no "Shop all" title */}
              {project.id === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-1">
                    {products.map((prod, i) => (
                      <button key={prod.name} type="button" onClick={openProduct(i)} className="text-left">
                        <div className={cn("aspect-square rounded-none", prod.color)} />
                        <p className={cn("text-[9px] font-medium", t.accent)}>{prod.name}</p>
                        <p className={cn("text-[8px]", t.textMuted)}>{prod.price}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {/* FitGear: category tabs + grid */}
              {project.id === 3 && (
                <>
                  <div className="flex gap-1 border-b border-slate-200 pb-2">
                    <span className={cn("text-[9px] font-medium border-b-2 border-red-600 pb-0.5", t.accent)}>Equipment</span>
                    <button type="button" className={cn("text-[9px]", t.textMuted)}>Bundles</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {products.map((prod, i) => (
                      <button key={prod.name} type="button" onClick={openProduct(i)} className="text-left">
                        <div className={cn("aspect-square rounded-lg border border-slate-200 mb-1", prod.color)} />
                        <p className={cn("text-[9px] font-medium", t.accent)}>{prod.name}</p>
                        <p className={cn("text-[8px]", t.textMuted)}>{prod.price}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {/* Artisan: "Subscribe" callout + grid */}
              {project.id === 4 && (
                <>
                  <button type="button" onClick={openProduct(0)} className="w-full p-2 rounded-lg bg-amber-600/20 border border-amber-500/40 text-left mb-2">
                    <p className={cn("text-[9px] font-medium", t.accent)}>Subscribe & save 15%</p>
                    <p className={cn("text-[8px]", t.textMuted)}>House Blend · $18</p>
                  </button>
                  <div className="grid grid-cols-3 gap-2">
                    {products.map((prod, i) => (
                      <button key={prod.name} type="button" onClick={openProduct(i)} className="text-left">
                        <div className={cn("aspect-square rounded", prod.color)} />
                        <p className={cn("text-[9px]", t.accent)}>{prod.name}</p>
                        <p className={cn("text-[8px]", t.textMuted)}>{prod.price}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {/* Default: standard 3-col grid */}
              {project.id !== 2 && project.id !== 3 && project.id !== 4 && (
                <>
                  <p className={cn("text-[11px] font-medium", t.accent)}>Shop all</p>
                  <div className="grid grid-cols-3 gap-2">
                    {products.map((prod, i) => (
                      <button key={prod.name} type="button" onClick={openProduct(i)} className="text-left">
                        <div className={cn("aspect-square rounded-md mb-1", prod.color)} />
                        <p className={cn("text-[9px] font-medium", t.accent)}>{prod.name}</p>
                        <p className={cn("text-[8px]", t.textMuted)}>{prod.price}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button type="button" onClick={go("home")} className={cn("text-[9px] font-medium hover:underline", t.accent)}>
                ← Back to home
              </button>
            </div>
          )}

          {view === "product" && (
            <div className="space-y-2 pb-2">
              <div className="flex gap-2">
                <div
                  className={cn(
                    "w-20 h-20 rounded-md shrink-0",
                    products[selectedProduct].color
                  )}
                />
                <div className="min-w-0">
                  <p className={cn("text-[12px] font-medium", t.accent)}>
                    {products[selectedProduct].name}
                  </p>
                  <p className={cn("text-[10px] mb-2", t.textMuted)}>
                    {products[selectedProduct].price}
                  </p>
                  <button
                    type="button"
                    onClick={go("shop")}
                    className={cn(
                      "px-2.5 py-1.5 rounded text-[9px] font-medium w-full",
                      t.btn
                    )}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
              <p className={cn("text-[9px] leading-snug", t.textMuted)}>
                Premium quality. Free shipping on orders over $50.
              </p>
              <button
                type="button"
                onClick={go("shop")}
                className={cn("text-[9px] font-medium hover:underline", t.accent)}
              >
                ← Back to shop
              </button>
            </div>
          )}

          {view === "about" && (
            <div className="space-y-2 pb-2">
              <p className={cn("text-[11px] font-medium", t.accent)}>
                {t.aboutTitle}
              </p>
              <p className={cn("text-[9px] leading-snug", t.textMuted)}>
                {t.aboutText}
              </p>
              <button
                type="button"
                onClick={go("home")}
                className={cn("text-[9px] font-medium hover:underline", t.accent)}
              >
                ← Back to home
              </button>
            </div>
          )}

          {view === "contact" && (
            <div className="space-y-2 pb-2">
              <p className={cn("text-[11px] font-medium", t.accent)}>
                Get in touch
              </p>
              <p className={cn("text-[9px]", t.textMuted)}>
                hello@{project.title.toLowerCase().replace(/\s/g, "")}.com
              </p>
              <button
                type="button"
                onClick={go("home")}
                className={cn("text-[9px] font-medium hover:underline", t.accent)}
              >
                ← Back to home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
