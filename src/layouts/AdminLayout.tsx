import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import PageTransition from '../components/PageTransition';
import { AdminHeaderContext, type AdminHeaderContent } from './AdminHeaderContext';

export default function AdminLayout() {
  const [header, setHeader] = useState<AdminHeaderContent | null>(null);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--color-gray-100)]">
      <Sidebar />

      <div className="ml-[240px] flex min-h-screen flex-col">
        <header
          className="flex items-center justify-between gap-6 border-b border-[var(--color-gray-200)] bg-white px-8 py-3"
          style={{ minHeight: '64px' }}
        >
          <motion.div
            key={header?.title ?? 'Painel administrativo'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="flex w-full items-center justify-between gap-6"
          >
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[22px] text-[var(--color-dark)]">
                {header?.title ?? 'Painel administrativo'}
              </h1>
              {header?.subtitle && (
                <span className="text-xs text-[var(--color-gray-600)]">{header.subtitle}</span>
              )}
            </div>
            {header?.action}
          </motion.div>
        </header>

        <main className="flex-1 p-8">
          <AdminHeaderContext.Provider value={setHeader}>
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </AdminHeaderContext.Provider>
        </main>
      </div>
    </div>
  );
}
