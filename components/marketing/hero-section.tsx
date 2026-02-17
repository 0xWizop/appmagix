"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { AnimatedCta } from "@/components/marketing/animated-cta";
import { HeroGradient } from "@/components/marketing/hero-gradient";
import { Zap, CheckCircle } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function HeroSection() {
  return (
    <section className="section-padding min-h-[90vh] flex items-center relative overflow-hidden">
      <HeroGradient />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container-width relative">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem} className="mb-6">
            <Badge variant="secondary" className="gap-1 bg-brand-green/20 text-brand-green border border-brand-green/50 hover:bg-brand-green/20">
              <Zap className="w-3 h-3" />
              Now accepting new projects for Q1 2026
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-7xl font-medium mb-6 leading-tight tracking-tight"
            variants={staggerItem}
          >
            Apps & websites that{" "}
            <span className="gradient-text">actually work</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-text-secondary mb-8 max-w-2xl mx-auto"
            variants={staggerItem}
          >
            We build custom web apps, websites, and ecommerce experiences—with a
            strong focus on online stores. From Shopify builds to full custom
            platforms. No templates. No compromises.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={staggerItem}
          >
            <AnimatedCta href="/#intake" variant="primary" size="lg">
              Start Your Project
            </AnimatedCta>
            <AnimatedCta href="/apps" variant="outline" size="lg" showArrow={false}>
              Our Shopify Apps
            </AnimatedCta>
          </motion.div>

          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-text-muted"
            variants={staggerItem}
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-brand-green" />
              100+ Projects Delivered
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-brand-green" />
              Apps & Ecommerce
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-brand-green" />
              5-Star Reviews
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
