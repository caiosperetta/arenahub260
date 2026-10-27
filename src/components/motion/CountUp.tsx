import { useEffect, useRef } from 'react';
import { m, useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  format?: (n: number) => string;
}

export function CountUp({ value, duration = 1.4, prefix = '', suffix = '', className, format }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    if (reduceMotion && ref.current) {
      ref.current.textContent = format ? format(value) : `${prefix}${value.toLocaleString('pt-BR')}${suffix}`;
    }
  }, [reduceMotion, value, prefix, suffix, format]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current && !reduceMotion) {
        const rounded = Math.round(latest);
        ref.current.textContent = format ? format(rounded) : `${prefix}${rounded.toLocaleString('pt-BR')}${suffix}`;
      }
    });
    return unsubscribe;
  }, [springValue, prefix, suffix, format, reduceMotion]);

  return (
    <m.span ref={ref} className={className}>
      {format ? format(0) : `${prefix}0${suffix}`}
    </m.span>
  );
}
