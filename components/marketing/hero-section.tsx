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
            <Badge variant="outline" className="mb-4">
              Bespoke Design & Development
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-6xl font-medium tracking-tight mb-6"
            variants={staggerItem}
          >
            Build your next{" "}
            <span className="gradient-text">custom website</span> or app
            with confidence.
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-text-secondary mb-10 max-w-2xl mx-auto lg:mx-0"
            variants={staggerItem}
          >
            We design and build premium digital products — from marketing
            sites and SaaS platforms to custom e-commerce stores.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={staggerItem}
          >
            <AnimatedCta href="/#intake" variant="primary" size="lg">
              Start Your Project
            </AnimatedCta>
            <AnimatedCta href="/pricing" variant="outline" size="lg" showArrow={false}>
              View Pricing
            </AnimatedCta>
          </motion.div>

          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-text-muted"
            variants={staggerItem}
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-brand-green" />
              Expertly Delivered
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-brand-green" />
              Apps & Ecommerce
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-brand-green" />
              Trusted Globally
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
