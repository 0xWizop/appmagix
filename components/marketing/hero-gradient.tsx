"use client";

import { motion } from "framer-motion";

/** Hero background — visible gradients, gentle motion, texture */
export function HeroGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary radial glow — top center */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% -10%, rgba(34, 197, 94, 0.18) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 90% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 45%),
            radial-gradient(ellipse 60% 40% at 10% 60%, rgba(34, 197, 94, 0.08) 0%, transparent 40%),
            radial-gradient(ellipse 50% 35% at 70% 85%, rgba(34, 197, 94, 0.06) 0%, transparent 40%)
          `,
        }}
      />

      {/* Animated soft orbs — gentle pulse */}
      <motion.div
        className="absolute top-20 right-1/4 h-64 w-64 rounded-full bg-brand-green/12 blur-[80px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 left-1/5 h-48 w-48 rounded-full bg-brand-green/10 blur-[60px]"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 right-1/5 h-40 w-40 rounded-full bg-brand-green/8 blur-[70px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle diagonal line pattern — texture not grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            105deg,
            transparent,
            transparent 2px,
            rgb(34 197 94) 2px,
            rgb(34 197 94) 3px
          )`,
          backgroundSize: "100px 100px",
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Bottom vignette */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2"
        style={{
          background: "linear-gradient(to top, rgba(9, 9, 11, 0.5), transparent)",
        }}
      />
    </div>
  );
}
