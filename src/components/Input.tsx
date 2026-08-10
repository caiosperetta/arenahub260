import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-[var(--radius-sm)] border-[0.5px] border-[#CBD5E1] px-[14px] py-[10px] text-sm text-[var(--color-dark)] placeholder:text-[var(--color-gray-400)] outline-none transition-colors',
        'focus:border-[1.5px] focus:border-[var(--color-primary)]',
        className,
      )}
      {...props}
    />
  );
}
