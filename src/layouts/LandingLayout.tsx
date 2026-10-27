import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Triangle, Menu, X, ArrowUp } from 'lucide-react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import { openWhatsApp } from '../lib/whatsapp';

const navLinks = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Preços', href: '#precos' },
  { label: 'Cases', href: '#cases' },
  { label: 'Segurança', href: '#seguranca' },
];

export default function LandingLayout() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowTop(window.scrollY > 300);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-white">
        <header
          className={`fixed inset-x-0 top-0 z-50 flex h-[72px] items-center justify-between px-6 transition-all duration-300 md:px-20 ${
            scrolled
              ? 'border-b border-[var(--color-gray-200)] bg-white/80 shadow-[0_1px_0_rgba(0,0,0,0.02)] backdrop-blur-md'
              : 'border-b border-transparent bg-transparent'
          }`}
        >
          <m.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0"
          >
            <Triangle size={22} strokeWidth={1.5} color="var(--color-primary)" />
            <span className="text-lg text-[var(--color-dark)]">
              Arena<span className="font-medium text-[var(--color-primary)]">Hub</span>
            </span>
          </m.button>

          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="group relative text-sm text-[var(--color-dark)] no-underline"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[var(--color-primary)] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <m.div
            className="hidden items-center gap-3 md:flex"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Entrar
            </Button>
            <Button variant="primary" onClick={openWhatsApp}>
              Quero conhecer o ArenaHub
            </Button>
          </m.div>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            className="flex cursor-pointer items-center justify-center border-none bg-transparent p-2 text-[var(--color-dark)] md:hidden"
          >
            <Menu size={26} strokeWidth={1.5} />
          </button>
        </header>

        <AnimatePresence>
          {menuOpen && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[#0F172A] px-6 py-6 md:hidden"
            >
              <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Triangle size={22} strokeWidth={1.5} color="var(--color-primary)" />
                  <span className="text-lg text-white">
                    Arena<span className="font-medium text-[var(--color-primary)]">Hub</span>
                  </span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Fechar menu"
                  className="flex cursor-pointer items-center justify-center border-none bg-transparent p-2 text-white"
                >
                  <X size={26} strokeWidth={1.5} />
                </button>
              </div>

              <m.nav
                className="flex flex-col gap-2"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
              >
                {navLinks.map((link) => (
                  <m.a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                    className="border-b border-[rgba(255,255,255,0.08)] py-4 text-xl text-white no-underline"
                  >
                    {link.label}
                  </m.a>
                ))}
              </m.nav>

              <m.div
                className="mt-auto flex flex-col gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Button
                  variant="secondary"
                  className="w-full justify-center border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Entrar
                </Button>
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => {
                    setMenuOpen(false);
                    openWhatsApp();
                  }}
                >
                  Quero conhecer o ArenaHub
                </Button>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>

        <main className="pt-[72px]">
          <Outlet />
        </main>

        <AnimatePresence>
          {showTop && (
            <m.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Voltar ao topo"
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 10 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-6 right-6 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none bg-[var(--color-dark)] text-white shadow-[var(--shadow-modal)]"
            >
              <ArrowUp size={20} strokeWidth={1.5} />
            </m.button>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
