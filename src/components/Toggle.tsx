import { motion } from 'framer-motion';

interface ToggleProps {
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function Toggle({ on, onToggle, disabled }: ToggleProps) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onToggle}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      className="relative h-5 w-9 shrink-0 cursor-pointer rounded-[var(--radius-full)] border-none transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      style={{ backgroundColor: on ? 'var(--color-primary)' : '#CBD5E1' }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
        style={{ left: on ? '18px' : '2px' }}
      />
    </motion.button>
  );
}
