/**
 * Shared motion config and variants for app-wide animations.
 * Respects prefers-reduced-motion when possible.
 */

export const spring = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1,
} as const;

export const springSlow = {
  type: "spring",
  stiffness: 200,
  damping: 25,
} as const;

export const tweenFast = {
  type: "tween",
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1],
} as const;

export const tweenMedium = {
  type: "tween",
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1],
} as const;

export const tweenSlow = {
  type: "tween",
  duration: 0.6,
  ease: [0.33, 1, 0.68, 1],
} as const;

/** Fade up for scroll-triggered content */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
} as const;

/** Fade only */
export const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

/** Scale in (for modals / cards) */
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
} as const;

/** Stagger container: use with staggerChildren on parent */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
} as const;

/** Stagger item (use inside stagger container) */
export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
} as const;

/** Hero text line reveal */
export const lineReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
} as const;
