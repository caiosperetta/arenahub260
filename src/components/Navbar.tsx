import { Building2 } from 'lucide-react';
import { NavLink, useParams } from 'react-router-dom';
import { cn } from '../lib/cn';

const navItems = [
  { label: 'Reservar', to: '' },
  { label: 'Minhas reservas', to: '/minhas-reservas' },
  { label: 'Meu perfil', to: '/perfil' },
];

export default function Navbar() {
  const { slug = '' } = useParams();

  return (
    <header className="flex h-[60px] items-center justify-between border-b border-[var(--color-gray-200)] bg-white px-12">
      <div className="flex items-center gap-2.5">
        <Building2 size={20} strokeWidth={1.5} color="var(--color-dark)" />
        <span className="text-base text-[var(--color-dark)]">Arena Rossato</span>
      </div>
      <div className="flex items-center gap-6">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={`/${slug}${item.to}`}
            end={item.to === ''}
            className={({ isActive }) =>
              cn('text-sm no-underline', isActive ? 'font-medium text-[var(--color-dark)]' : 'text-[var(--color-gray-600)]')
            }
          >
            {item.label}
          </NavLink>
        ))}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-medium text-[var(--color-success-text)]">
          MS
        </div>
      </div>
    </header>
  );
}
