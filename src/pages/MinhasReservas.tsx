import { useState } from 'react';
import { MapPin, CalendarX } from 'lucide-react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { cn } from '../lib/cn';

type TabKey = 'proximas' | 'anteriores' | 'canceladas';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'proximas', label: 'Próximas' },
  { key: 'anteriores', label: 'Anteriores' },
  { key: 'canceladas', label: 'Canceladas' },
];

interface Booking {
  court: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'inactive';
  label: string;
  showCancel: boolean;
}

const bookingsByTab: Record<TabKey, Booking[]> = {
  proximas: [
    { court: 'Quadra 2 · Beach Tennis', date: '08/08/2026', time: '19:00 – 20:00', status: 'confirmed', label: 'Confirmado', showCancel: true },
    { court: 'Quadra 1 · Society', date: '10/08/2026', time: '20:00 – 21:00', status: 'pending', label: 'Pendente', showCancel: true },
    { court: 'Quadra 3 · Futsal', date: '14/08/2026', time: '18:00 – 19:00', status: 'confirmed', label: 'Confirmado', showCancel: true },
  ],
  anteriores: [
    { court: 'Quadra 2 · Beach Tennis', date: '30/07/2026', time: '19:00 – 20:00', status: 'inactive', label: 'Concluída', showCancel: false },
    { court: 'Quadra 1 · Society', date: '24/07/2026', time: '20:00 – 21:00', status: 'inactive', label: 'Concluída', showCancel: false },
    { court: 'Quadra 2 · Beach Tennis', date: '17/07/2026', time: '19:00 – 20:00', status: 'inactive', label: 'Concluída', showCancel: false },
  ],
  canceladas: [],
};

export default function MinhasReservas() {
  const [activeTab, setActiveTab] = useState<TabKey>('proximas');
  const bookings = bookingsByTab[activeTab];

  return (
    <div className="-mx-12 bg-[var(--color-gray-100)] px-12 pb-16 pt-10">
      <h1 className="mb-6 text-2xl text-[var(--color-dark)]">Minhas reservas</h1>

      <div className="mb-5 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'cursor-pointer rounded-[var(--radius-md)] px-4 py-2 text-[13px] font-medium',
              activeTab === tab.key
                ? 'border-none bg-[var(--color-dark)] text-white'
                : 'border-[0.5px] border-[#CBD5E1] bg-white text-[var(--color-dark)]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {bookings.length > 0 ? (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <div
              key={`${b.court}-${b.date}`}
              className="flex items-center justify-between rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-gray-200)] bg-white px-5 py-4.5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--color-gray-100)]">
                  <MapPin size={18} strokeWidth={1.5} color="var(--color-gray-600)" />
                </div>
                <div>
                  <div className="text-[15px] text-[var(--color-dark)]">{b.court}</div>
                  <div className="mt-0.5 text-[13px] text-[var(--color-gray-600)]">
                    {b.date} · {b.time}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge status={b.status}>{b.label}</Badge>
                {b.showCancel && (
                  <Button variant="ghost-destructive" className="px-3.5 py-1.5 text-xs">
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-gray-200)] bg-white py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-gray-100)]">
            <CalendarX size={24} strokeWidth={1.5} color="var(--color-gray-400)" />
          </div>
          <div className="text-[15px] text-[var(--color-dark)]">Nenhuma reserva cancelada</div>
          <div className="text-[13px] text-[var(--color-gray-600)]">Reservas que você cancelar aparecerão aqui.</div>
        </div>
      )}
    </div>
  );
}
