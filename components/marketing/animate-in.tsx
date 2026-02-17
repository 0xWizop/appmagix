"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AnimationType = "fadeUp" | "fade" | "slideUp" | "scaleIn";

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in ms before animation runs (for stagger) */
  delay?: number;
  /** Animation style */
  animation?: AnimationType;
  /** Root margin for Intersection Observer (e.g. "0px 0px -80px 0px" to trigger slightly before in view) */
  rootMargin?: string;
  /** Only animate once (default true) */
  once?: boolean;
}

export function AnimateIn({
  children,
  className,
  delay = 0,
  animation = "fadeUp",
  rootMargin = "0px 0px -40px 0px",
  once = true,
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            timeoutRef.current = setTimeout(() => setVisible(true), delay);
          } else {
            setVisible(true);
          }
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.1, rootMargin }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [delay, once, rootMargin]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        !visible && "opacity-0 translate-y-6",
        visible && "opacity-100 translate-y-0",
        animation === "fade" && !visible && "translate-y-0",
        animation === "scaleIn" && !visible && "scale-95 translate-y-0",
        animation === "scaleIn" && visible && "scale-100",
        className
      )}
      style={{
        transitionDelay: visible ? "0ms" : undefined,
      }}
    >
      {children}
    </div>
  );
}
