import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl text-[var(--color-dark)]">{title}</h1>
      <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-gray-200)] bg-white py-24 text-[var(--color-gray-400)]">
        <Construction size={24} strokeWidth={1.5} />
        <span className="text-sm">Em construção</span>
      </div>
    </div>
  );
}
