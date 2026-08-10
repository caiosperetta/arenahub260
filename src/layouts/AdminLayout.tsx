import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AdminHeaderContext, type AdminHeaderContent } from './AdminHeaderContext';

export default function AdminLayout() {
  const [header, setHeader] = useState<AdminHeaderContent | null>(null);

  return (
    <div className="min-h-screen bg-[var(--color-gray-100)]">
      <Sidebar />

      <div className="ml-[240px] flex min-h-screen flex-col">
        <header className="flex min-h-16 items-center justify-between gap-6 border-b border-[var(--color-gray-200)] bg-white px-8 py-3">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[22px] text-[var(--color-dark)]">
              {header?.title ?? 'Painel administrativo'}
            </h1>
            {header?.subtitle && (
              <span className="text-xs text-[var(--color-gray-600)]">{header.subtitle}</span>
            )}
          </div>
          {header?.action}
        </header>

        <main className="flex-1 p-8">
          <AdminHeaderContext.Provider value={setHeader}>
            <Outlet />
          </AdminHeaderContext.Provider>
        </main>
      </div>
    </div>
  );
}
