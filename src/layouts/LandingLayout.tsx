import { Outlet } from 'react-router-dom';
import { Triangle } from 'lucide-react';
import Button from '../components/Button';

const navLinks = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Preços', href: '#precos' },
  { label: 'Cases', href: '#depoimentos' },
];

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[var(--color-gray-200)] bg-white px-20">
        <div className="flex items-center gap-2">
          <Triangle size={22} strokeWidth={1.5} color="var(--color-primary)" />
          <span className="text-lg text-[var(--color-dark)]">
            Arena<span className="font-medium text-[var(--color-primary)]">Hub</span>
          </span>
        </div>

        <nav className="flex items-center gap-10">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-sm text-[var(--color-dark)] no-underline">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="secondary">Entrar</Button>
          <Button variant="primary">Começar grátis</Button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
