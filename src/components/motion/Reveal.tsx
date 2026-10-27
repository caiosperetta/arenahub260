import type { ReactNode } from 'react';
import { m } from 'framer-motion';
import { fadeInUp, staggerContainer, viewportOnce } from '../../lib/motion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

export function Reveal({ children, className, stagger, delay = 0 }: RevealProps) {
  const variants = stagger !== undefined ? staggerContainer(stagger, delay) : fadeInUp;

  return (
    <m.div className={className} initial="hidden" whileInView="show" viewport={viewportOnce} variants={variants}>
      {children}
    </m.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div className={className} variants={fadeInUp}>
      {children}
    </m.div>
  );
}
