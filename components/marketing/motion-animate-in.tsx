"use client";

import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { fadeUp, fade, scaleIn, springSlow, tweenMedium } from "@/lib/motion";

type VariantKey = "fadeUp" | "fade" | "scaleIn";

const variants = {
  fadeUp: { ...fadeUp, transition: springSlow },
  fade: { ...fade, transition: tweenMedium },
  scaleIn: { ...scaleIn, transition: springSlow },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

interface MotionAnimateInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: VariantKey;
  rootMargin?: string;
  once?: boolean;
  /** When true, wraps children in a stagger container — each direct child animates in sequence */
  stagger?: boolean;
}

export function MotionAnimateIn({
  children,
  className,
  delay = 0,
  animation = "fadeUp",
  rootMargin = "0px 0px -40px 0px",
  once = true,
  stagger = false,
}: MotionAnimateInProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.1, margin: rootMargin as never, once });

  const v = variants[animation];

  if (stagger) {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={staggerContainer}
        className={cn(className)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: v.hidden,
        visible: v.visible,
      }}
      transition={{
        ...springSlow,
        delay: delay / 1000,
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

/** A single child item that animates when its MotionAnimateIn parent is in view (stagger mode) */
export function MotionItem({
  children,
  className,
  animation = "fadeUp",
}: {
  children: React.ReactNode;
  className?: string;
  animation?: VariantKey;
}) {
  const v = variants[animation];
  return (
    <motion.div
      variants={{
        hidden: v.hidden,
        visible: { ...v.visible, transition: springSlow },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
