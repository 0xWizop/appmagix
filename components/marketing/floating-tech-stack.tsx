"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { 
  Globe, Code2, Palette, LineChart, Wrench, Headphones, 
  Smartphone, ShoppingBag, Database, Shield, Zap 
} from "lucide-react";

const techIcons = [
  { icon: Globe, name: "Next.js", color: "text-white" },
  { icon: Code2, name: "React", color: "text-brand-green" },
  { icon: Database, name: "Prisma", color: "text-blue-400" },
  { icon: Shield, name: "Auth", color: "text-orange-400" },
  { icon: Smartphone, name: "Mobile", color: "text-purple-400" },
  { icon: ShoppingBag, name: "Shopify", color: "text-brand-green" },
  { icon: Zap, name: "Speed", color: "text-yellow-400" },
  { icon: Palette, name: "Design", color: "text-pink-400" },
  { icon: LineChart, name: "Analytics", color: "text-emerald-400" },
  { icon: Wrench, name: "DevOps", color: "text-slate-400" },
];

export function FloatingTechStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-4xl mx-auto min-h-[400px] flex flex-wrap justify-center items-center gap-8 py-12 px-4"
    >
      {techIcons.map((tech, i) => (
        <TechIcon 
          key={tech.name} 
          tech={tech} 
          index={i} 
          mouseX={mouseX} 
          mouseY={mouseY} 
        />
      ))}
    </div>
  );
}

function TechIcon({ tech, index, mouseX, mouseY }: any) {
  const x = useSpring(useTransform(mouseX, [-0.5, 0.5], [(index % 2 === 0 ? -30 : 30), (index % 2 === 0 ? 30 : -30)]), { stiffness: 50, damping: 20 });
  const y = useSpring(useTransform(mouseY, [-0.5, 0.5], [(index % 3 === 0 ? -20 : 20), (index % 3 === 0 ? 20 : -20)]), { stiffness: 50, damping: 20 });

  return (
    <motion.div
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col items-center gap-2 p-6 rounded-2xl bg-surface border border-border hover:border-brand-green/50 transition-colors shadow-lg hover:shadow-brand-green/10"
    >
      <div className={`p-4 rounded-xl bg-background/50 flex items-center justify-center group-hover:scale-110 transition-transform ${tech.color}`}>
        <tech.icon className="w-10 h-10" />
      </div>
      <span className="text-sm font-medium text-text-secondary group-hover:text-white transition-colors">
        {tech.name}
      </span>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-brand-green/0 group-hover:bg-brand-green/2 blur-2xl transition-all pointer-events-none" />
    </motion.div>
  );
}
