import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { cn } from '../lib/cn';
import { useAdminHeader } from '../layouts/AdminHeaderContext';

interface CourtData {
  name: string;
  sport: string;
  price: string;
  active: boolean;
}

const initialCourts: CourtData[] = [
  { name: 'Quadra 1', sport: 'Society', price: 'R$80/hora', active: true },
  { name: 'Quadra 2', sport: 'Beach Tennis', price: 'R$70/hora', active: true },
  { name: 'Quadra 3', sport: 'Futsal', price: 'R$90/hora', active: true },
  { name: 'Quadra 4', sport: 'Vôlei', price: 'R$60/hora', active: false },
];

const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const times: string[] = [];
for (let h = 7; h <= 22; h += 2) times.push(`${String(h).padStart(2, '0')}:00`);

type CellStatus = 'available' | 'booked' | 'blocked';

const cellStyle: Record<CellStatus, { bg: string; color: string; label: string }> = {
  available: { bg: 'var(--color-white)', color: 'var(--color-gray-400)', label: 'Livre' },
  booked: { bg: 'var(--color-success-bg)', color: 'var(--color-success-text)', label: 'Reservado' },
  blocked: { bg: 'var(--color-error-bg)', color: 'var(--color-error-text)', label: 'Bloqueado' },
};

function cellStatus(timeIndex: number, dayIndex: number, courtIdx: number): CellStatus {
  const seed = (timeIndex * 3 + dayIndex + courtIdx) % 6;
  if (seed === 0) return 'booked';
  if (seed === 5) return 'blocked';
  return 'available';
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="relative h-5 w-9 shrink-0 cursor-pointer rounded-[var(--radius-full)] border-none transition-colors"
      style={{ backgroundColor: on ? 'var(--color-primary)' : '#CBD5E1' }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
        style={{ left: on ? '18px' : '2px' }}
      />
    </button>
  );
}

export default function Quadras() {
  const [courts, setCourts] = useState(initialCourts);
  const [scheduleCourtIdx, setScheduleCourtIdx] = useState(0);

  useAdminHeader({
    title: 'Quadras',
    subtitle: '4 quadras cadastradas',
    action: (
      <Button variant="primary">
        <Plus size={16} strokeWidth={1.5} />
        Nova quadra
      </Button>
    ),
  });

  const toggleActive = (idx: number) => {
    setCourts((prev) => prev.map((c, i) => (i === idx ? { ...c, active: !c.active } : c)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        {courts.map((court, idx) => (
          <Card key={court.name} className="overflow-hidden p-0">
            <div
              className="flex h-[100px] items-center justify-center"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg, var(--color-gray-100) 0px, var(--color-gray-100) 8px, var(--color-gray-200) 8px, var(--color-gray-200) 16px)',
              }}
            >
              <span className="font-mono text-[11px] text-[var(--color-gray-400)]">foto da quadra</span>
            </div>
            <div className="p-4">
              <div className="mb-1.5 flex items-start justify-between">
                <div className="text-[15px] text-[var(--color-dark)]">{court.name}</div>
                <Pencil size={15} strokeWidth={1.5} color="var(--color-gray-600)" className="cursor-pointer" />
              </div>
              <Badge status="info">{court.sport}</Badge>
              <div className="my-3 text-sm text-[var(--color-gray-600)]">{court.price}</div>
              <div className="flex items-center justify-between border-t border-[var(--color-gray-100)] pt-3">
                <span className="text-[13px] text-[var(--color-dark)]">{court.active ? 'Ativa' : 'Inativa'}</span>
                <Toggle on={court.active} onToggle={() => toggleActive(idx)} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[15px] text-[var(--color-dark)]">Agenda semanal</div>
          <div className="flex gap-2">
            {courts.map((court, idx) => (
              <button
                key={court.name}
                onClick={() => setScheduleCourtIdx(idx)}
                className={cn(
                  'cursor-pointer rounded-[var(--radius-md)] px-3.5 py-1.5 text-[13px] font-medium',
                  scheduleCourtIdx === idx
                    ? 'border-none bg-[var(--color-primary)] text-white'
                    : 'border-[0.5px] border-[#CBD5E1] bg-white text-[var(--color-dark)]',
                )}
              >
                {court.name}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-gray-200)]">
          <div className="grid grid-cols-[70px_repeat(7,1fr)]">
            <div className="bg-[var(--color-gray-50)] p-2" />
            {days.map((d) => (
              <div key={d} className="border-l border-[var(--color-gray-200)] bg-[var(--color-gray-50)] p-2 text-center">
                <span className="text-xs text-[var(--color-dark)]">{d}</span>
              </div>
            ))}
          </div>
          {times.map((time, ti) => (
            <div key={time} className="grid grid-cols-[70px_repeat(7,1fr)] border-t border-[var(--color-gray-200)]">
              <div className="border-r border-[var(--color-gray-200)] px-2 py-1.5 text-[11px] text-[var(--color-gray-400)]">
                {time}
              </div>
              {days.map((d, di) => {
                const status = cellStatus(ti, di, scheduleCourtIdx);
                const s = cellStyle[status];
                return (
                  <div
                    key={`${time}-${d}`}
                    className="border-l border-[var(--color-gray-200)] px-1.5 py-1.5 text-center"
                    style={{ backgroundColor: s.bg }}
                  >
                    <span className="text-[10px]" style={{ color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
