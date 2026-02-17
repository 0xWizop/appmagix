"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MessageSquare, Palette, Code2, Rocket, Check } from "lucide-react";

interface ProcessStep {
  step: string;
  title: string;
  description: string;
  details?: string[];
}

const stepIcons = [MessageSquare, Palette, Code2, Rocket];

interface ProcessTabsProps {
  steps: ProcessStep[];
}

export function ProcessTabs({ steps }: ProcessTabsProps) {
  const [active, setActive] = useState(0);
  const current = steps[active];
  const Icon = stepIcons[active];

  return (
    <div className="space-y-8">
      {/* Step cards — green & black/gray */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, i) => {
          const StepIcon = stepIcons[i];
          const isActive = i === active;
          return (
            <button
              key={step.step}
              onClick={() => setActive(i)}
              className={`group relative flex flex-col items-center text-left p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer bg-black ${
                isActive
                  ? "border-brand-green shadow-lg shadow-black/40"
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <div
                className={`flex items-center justify-center h-12 w-12 rounded-xl mb-4 transition-colors ${
                  isActive ? "bg-brand-green" : "bg-zinc-700"
                }`}
              >
                <StepIcon className={`h-6 w-6 ${isActive ? "text-black" : "text-brand-green"}`} />
              </div>
              <span className="text-sm font-medium text-brand-green mb-1">{step.step}</span>
              <h3 className="font-medium text-white transition-colors text-center">
                {step.title}
              </h3>
            </button>
          );
        })}
      </div>

      {/* Content panel — green & black/gray */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="relative rounded-xl border-2 border-zinc-700 bg-black p-8 md:p-10"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-brand-green shrink-0">
              <Icon className="h-7 w-7 text-black" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-brand-green font-mono text-sm font-medium">{current.step}</span>
                <ChevronRight className="h-4 w-4 text-brand-green/80" />
                <h3 className="text-xl font-medium text-white">{current.title}</h3>
              </div>
              <p className="text-white/80 leading-relaxed text-base max-w-2xl">
                {current.description}
              </p>
              {current.details && current.details.length > 0 && (
                <ul className="space-y-3 pt-2">
                  {current.details.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                      <Check className="h-5 w-5 text-brand-green shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
