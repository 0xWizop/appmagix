"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0);
  const current = testimonials[index];

  const next = useCallback(() => setIndex((i) => (i + 1) % testimonials.length), [testimonials.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length), [testimonials.length]);

  const goTo = (i: number) => setIndex(i);

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Card — click left 1/3 = prev, click right 1/3 = next */}
      <div className="relative flex">
        <button
          onClick={prev}
          className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer touch-manipulation"
          aria-label="Previous testimonial"
        />
        <button
          onClick={next}
          className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
          aria-label="Next testimonial"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-none border-border">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-brand-green text-brand-green" />
                  ))}
                </div>
                <p className="text-lg text-text-secondary mb-6">&ldquo;{current.quote}&rdquo;</p>
                <div>
                  <div className="font-medium">{current.author}</div>
                  <div className="text-sm text-text-muted">{current.role}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation — large, clearly clickable buttons */}
      <div className="flex items-center justify-center gap-5 mt-6">
        <button
          onClick={prev}
          className="flex items-center justify-center h-12 w-12 rounded-full border-2 border-border bg-surface hover:border-brand-green hover:bg-brand-green/10 text-text-primary hover:text-brand-green transition-all cursor-pointer touch-manipulation active:scale-95"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2 items-center">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all cursor-pointer touch-manipulation ${
                i === index
                  ? "h-3 w-8 bg-brand-green"
                  : "h-3 w-3 bg-border hover:bg-brand-green/60 hover:scale-110"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="flex items-center justify-center h-12 w-12 rounded-full border-2 border-border bg-surface hover:border-brand-green hover:bg-brand-green/10 text-text-primary hover:text-brand-green transition-all cursor-pointer touch-manipulation active:scale-95"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <p className="text-center text-sm text-text-muted mt-3">Click arrows or dots to browse · Tap card edges to navigate</p>
    </div>
  );
}
