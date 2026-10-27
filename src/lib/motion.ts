import type { Variants, Transition } from 'framer-motion';

export const EASE_OUT: Transition['ease'] = [0.16, 1, 0.3, 1];

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  show: {
    opacity: 1,
    scale: [0, 1.1, 1],
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export function staggerContainer(stagger = 0.1, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

export const viewportOnce = { once: true, margin: '-80px' };

export const springy: Transition = { type: 'spring', stiffness: 400, damping: 28 };
