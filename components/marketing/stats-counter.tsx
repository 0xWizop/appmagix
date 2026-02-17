"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";

interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

interface StatsCounterProps {
  stats: Stat[];
  className?: string;
}

function useCountUp(end: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - (startTimeRef.current ?? now);
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easeOut * end));

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    return () => { startTimeRef.current = null; };
  }, [start, end, duration]);

  return count;
}

function AnimatedStat({ stat, start }: { stat: Stat; start: boolean }) {
  const count = useCountUp(stat.value, 1500, start);

  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-medium text-brand-green mb-1">
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div className="text-sm text-text-muted">{stat.label}</div>
    </div>
  );
}

export function StatsCounter({ stats, className = "" }: StatsCounterProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className={`grid grid-cols-2 sm:grid-cols-4 gap-8 ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {stats.map((stat, i) => (
        <AnimatedStat key={stat.label} stat={stat} start={inView} />
      ))}
    </motion.div>
  );
}
