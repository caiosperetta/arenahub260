import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'ghost-destructive';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] border border-transparent',
  secondary: 'bg-transparent text-[var(--color-dark)] border-[0.5px] border-[#CBD5E1] hover:bg-[var(--color-gray-50)]',
  ghost: 'bg-transparent text-[var(--color-primary)] border-[0.5px] border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]',
  destructive: 'bg-[var(--color-error)] text-white border border-transparent hover:opacity-90',
  'ghost-destructive': 'bg-transparent text-[var(--color-error)] border-[0.5px] border-[var(--color-error)] hover:bg-[var(--color-error-bg)]',
};

export default function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
