import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border-[0.5px] border-[var(--color-gray-200)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-card)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
