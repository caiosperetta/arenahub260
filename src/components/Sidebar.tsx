import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Map,
  Users,
  Wallet,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/cn';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: 'Home', to: '/', icon: LayoutDashboard },
  { label: 'Reservas', to: '/reservas', icon: CalendarCheck },
  { label: 'Quadras', to: '/quadras', icon: Map },
  { label: 'Clientes', to: '/clientes', icon: Users },
  { label: 'Financeiro', to: '/financeiro', icon: Wallet },
  { label: 'Configurações', to: '/configuracoes', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 flex w-[240px] flex-col bg-[var(--color-dark)]">
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-medium text-white">
          Arena<span className="text-[var(--color-primary)]">Hub</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-[rgba(34,197,94,0.1)] text-white'
                  : 'text-[rgba(255,255,255,0.65)] hover:bg-[rgba(255,255,255,0.05)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  color={isActive ? '#22C55E' : 'rgba(255,255,255,0.4)'}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-[rgba(255,255,255,0.08)] px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-dark-3)] text-sm text-white">
          A
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-sm text-white">Administrador</span>
          <span className="truncate text-xs text-[rgba(255,255,255,0.5)]">admin@arenahub.com</span>
        </div>
      </div>
    </aside>
  );
}
