import type { LucideIcon } from 'lucide-react';
import Card from './Card';
import { cn } from '../lib/cn';

interface MetricCardProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  label: string;
  value: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'warning' | 'neutral';
}

const trendStyles = {
  positive: 'text-[var(--color-success-text)]',
  negative: 'text-[var(--color-error-text)]',
  warning: 'text-[var(--color-warning-text)]',
  neutral: 'text-[var(--color-gray-600)]',
};

export default function MetricCard({
  icon: Icon,
  iconColor = 'var(--color-primary)',
  iconBg = 'var(--color-primary-light)',
  label,
  value,
  trend,
  trendType = 'neutral',
}: MetricCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} strokeWidth={1.5} color={iconColor} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-[var(--color-gray-400)]">{label}</span>
        <span className="text-2xl text-[var(--color-dark)]">{value}</span>
        {trend && <span className={cn('text-xs', trendStyles[trendType])}>{trend}</span>}
      </div>
    </Card>
  );
}
