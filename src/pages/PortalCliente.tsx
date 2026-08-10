import { useState } from 'react';
import { MapPin, Calendar, Clock, Timer, Wallet, X, Info } from 'lucide-react';
import Badge from '../components/Badge';
import Button from '../components/Button';

interface Court {
  name: string;
  sport: string;
  price: string;
}

const courtsData: Court[] = [
  { name: 'Quadra 1', sport: 'Society', price: 'R$80/h' },
  { name: 'Quadra 2', sport: 'Beach Tennis', price: 'R$70/h' },
  { name: 'Quadra 3', sport: 'Futsal', price: 'R$90/h' },
];

const days = [
  { label: 'Seg', date: '03/08' },
  { label: 'Ter', date: '04/08' },
  { label: 'Qua', date: '05/08' },
  { label: 'Qui', date: '06/08' },
  { label: 'Sex', date: '07/08' },
  { label: 'Sáb', date: '08/08' },
  { label: 'Dom', date: '09/08' },
];

const times: string[] = [];
for (let h = 7; h <= 22; h++) times.push(`${String(h).padStart(2, '0')}:00`);

type SlotStatus = 'available' | 'occupied' | 'pending';

const statusStyle: Record<SlotStatus, { bg: string; color: string; textDecoration: string; cursor: string; label: string }> = {
  available: { bg: 'var(--color-success-bg)', color: 'var(--color-success-text)', textDecoration: 'none', cursor: 'pointer', label: 'Disponível' },
  occupied: { bg: 'var(--color-gray-100)', color: 'var(--color-gray-400)', textDecoration: 'line-through', cursor: 'default', label: 'Ocupado' },
  pending: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning-text)', textDecoration: 'none', cursor: 'default', label: 'Pendente' },
};

function slotStatus(timeIndex: number, dayIndex: number): SlotStatus {
  const seed = (timeIndex * 3 + dayIndex) % 5;
  if (seed === 0) return 'occupied';
  if (seed === 2) return 'pending';
  return 'available';
}

interface SelectedSlot {
  day: string;
  time: string;
}

export default function PortalCliente() {
  const [selectedCourtIdx, setSelectedCourtIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  const selectedCourt = courtsData[selectedCourtIdx];

  const openSlot = (day: string, time: string, status: SlotStatus) => {
    if (status !== 'available') return;
    setSelectedSlot({ day, time });
  };

  const closeSlot = () => setSelectedSlot(null);

  let panelTimeRange = '';
  let panelPrice = '';
  if (selectedSlot) {
    const [h] = selectedSlot.time.split(':').map(Number);
    const endH = String(h + 1).padStart(2, '0');
    panelTimeRange = `${selectedSlot.time} – ${endH}:00`;
    panelPrice = selectedCourt.price.replace('/h', ',00');
  }

  return (
    <div className="relative flex flex-col gap-6">
      <div>
        <div className="mb-4 text-[15px] text-[var(--color-dark)]">Escolha a quadra</div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {courtsData.map((court, idx) => {
            const isSelected = selectedCourtIdx === idx;
            return (
              <div
                key={court.name}
                className="w-[220px] shrink-0 overflow-hidden rounded-[var(--radius-lg)] bg-white"
                style={{ border: isSelected ? '2px solid var(--color-primary)' : '0.5px solid var(--color-gray-200)' }}
              >
                <div
                  className="flex h-[120px] items-center justify-center"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(135deg, var(--color-gray-100) 0px, var(--color-gray-100) 8px, var(--color-gray-200) 8px, var(--color-gray-200) 16px)',
                  }}
                >
                  <span className="font-mono text-[11px] text-[var(--color-gray-400)]">foto da quadra</span>
                </div>
                <div className="p-3.5">
                  <div className="mb-1.5 text-sm text-[var(--color-dark)]">{court.name}</div>
                  <Badge status="info">{court.sport}</Badge>
                  <div className="my-2.5 text-[13px] text-[var(--color-gray-600)]">{court.price}</div>
                  <Button
                    variant={isSelected ? 'primary' : 'secondary'}
                    className="w-full px-2 py-2 text-[13px]"
                    onClick={() => setSelectedCourtIdx(idx)}
                  >
                    {isSelected ? 'Selecionada' : 'Selecionar'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-gray-200)]">
        <div className="grid grid-cols-[80px_repeat(7,1fr)]">
          <div className="bg-[var(--color-gray-100)] p-2.5" />
          {days.map((d) => (
            <div key={d.label} className="border-l border-[var(--color-gray-200)] bg-[var(--color-gray-100)] p-2.5 text-center">
              <div className="text-xs text-[var(--color-dark)]">{d.label}</div>
              <div className="text-[11px] text-[var(--color-gray-400)]">{d.date}</div>
            </div>
          ))}
        </div>
        {times.map((time, ti) => (
          <div key={time} className="grid grid-cols-[80px_repeat(7,1fr)] border-t border-[var(--color-gray-200)]">
            <div className="border-r border-[var(--color-gray-200)] p-2 text-xs text-[var(--color-gray-400)]">{time}</div>
            {days.map((d, di) => {
              const status = slotStatus(ti, di);
              const s = statusStyle[status];
              return (
                <div
                  key={`${time}-${d.label}`}
                  onClick={() => openSlot(d.label, time, status)}
                  className="border-l border-[var(--color-gray-200)] p-2 text-center"
                  style={{ backgroundColor: s.bg, cursor: s.cursor }}
                >
                  <span className="text-[11px]" style={{ color: s.color, textDecoration: s.textDecoration }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex gap-5">
        <span className="flex items-center gap-1.5 text-xs text-[var(--color-gray-600)]">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[var(--color-success-bg)]" />
          Disponível
        </span>
        <span className="flex items-center gap-1.5 text-xs text-[var(--color-gray-600)]">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px] border border-[var(--color-gray-200)] bg-[var(--color-gray-100)]" />
          Ocupado
        </span>
        <span className="flex items-center gap-1.5 text-xs text-[var(--color-gray-600)]">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[var(--color-warning-bg)]" />
          Aguardando aprovação
        </span>
      </div>

      {selectedSlot && (
        <>
          <div onClick={closeSlot} className="fixed inset-0 z-10 bg-[rgba(15,23,42,0.4)]" />
          <div className="fixed inset-y-0 right-0 z-20 flex w-[380px] flex-col bg-white p-8 shadow-[var(--shadow-modal)]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[22px] text-[var(--color-dark)]">Confirmar reserva</h2>
              <button onClick={closeSlot} className="border-none bg-transparent p-0 cursor-pointer" aria-label="Fechar">
                <X size={18} strokeWidth={1.5} color="var(--color-gray-600)" />
              </button>
            </div>

            <div className="mb-5 flex flex-col gap-3.5">
              <div className="flex items-center gap-2.5">
                <MapPin size={16} strokeWidth={1.5} color="var(--color-gray-600)" />
                <span className="text-sm text-[var(--color-dark)]">
                  {selectedCourt.name} · {selectedCourt.sport}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar size={16} strokeWidth={1.5} color="var(--color-gray-600)" />
                <span className="text-sm text-[var(--color-dark)]">Sexta, 08/08/2026</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={16} strokeWidth={1.5} color="var(--color-gray-600)" />
                <span className="text-sm text-[var(--color-dark)]">{panelTimeRange}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Timer size={16} strokeWidth={1.5} color="var(--color-gray-600)" />
                <span className="text-sm text-[var(--color-dark)]">1 hora</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Wallet size={16} strokeWidth={1.5} color="var(--color-gray-600)" />
                <span className="text-sm text-[var(--color-dark)]">{panelPrice}</span>
              </div>
            </div>

            <div className="mb-5 border-t border-[var(--color-gray-200)]" />

            <label className="mb-1.5 block text-[13px] text-[var(--color-dark)]">Observação para a arena</label>
            <textarea
              placeholder="Ex: chegaremos 10 minutos antes"
              className="mb-5 h-[72px] resize-none rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[var(--color-dark)] placeholder:text-[var(--color-gray-400)] outline-none focus:border-[1.5px] focus:border-[var(--color-primary)]"
            />

            <Button variant="primary" className="w-full">
              Confirmar reserva
            </Button>

            <div className="mt-3 flex items-start gap-1.5">
              <Info size={14} strokeWidth={1.5} color="var(--color-gray-400)" className="mt-0.5 shrink-0" />
              <span className="text-xs leading-relaxed text-[var(--color-gray-400)]">
                Esta reserva precisa de aprovação da arena. Você será notificado por email.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
