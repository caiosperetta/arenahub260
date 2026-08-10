import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

type BadgeStatus = 'confirmed' | 'pending' | 'cancelled' | 'info' | 'inactive';

interface BadgeProps {
  status: BadgeStatus;
  children: ReactNode;
  className?: string;
}

const statusStyles: Record<BadgeStatus, string> = {
  confirmed: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
  pending: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]',
  cancelled: 'bg-[var(--color-error-bg)] text-[var(--color-error-text)]',
  info: 'bg-[var(--color-info-bg)] text-[var(--color-info-text)]',
  inactive: 'bg-[var(--color-gray-100)] text-[var(--color-gray-600)]',
};

export default function Badge({ status, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-full)] px-3 py-1 text-xs font-medium',
        statusStyles[status],
        className,
      )}
    >
      {children}
    </span>
  );
}
