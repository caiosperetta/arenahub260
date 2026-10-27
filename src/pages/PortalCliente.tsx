import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Timer, Wallet, X, Info, ChevronLeft, ChevronRight, AlertCircle, LogIn } from 'lucide-react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { useTenantBySlug } from '../hooks/useTenantBySlug';
import { usePortalCliente, addDays, startOfWeek, toISODate } from '../hooks/usePortalCliente';
import { SkeletonCard } from '../components/Skeletons';
import type { Court, OpeningHours } from '../types';

const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatPrice(value: number): string {
  return currencyFormatter.format(value);
}

function formatDateShort(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
}

function formatDateFull(date: Date): string {
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date);
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${capitalized}, ${d}/${m}/${y}`;
}

function hourTime(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00:00`;
}

interface SelectedSlot {
  court: Court;
  date: Date;
  hour: number;
}

type CellStatus = 'closed' | 'no-slot' | 'occupied' | 'available';

function timeToHour(time: string): number {
  return Number(time.slice(0, 2));
}

function findOpeningHours(openingHours: OpeningHours[], weekday: number): OpeningHours | undefined {
  return openingHours.find((o) => o.weekday === weekday);
}

export default function PortalCliente() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tenant, loading: tenantLoading, error: tenantError } = useTenantBySlug(slug);
  const {
    courts,
    slots,
    openingHours,
    bookings,
    selectedCourtId,
    setSelectedCourtId,
    selectedWeek,
    setSelectedWeek,
    createBooking,
    loading,
    openingHoursLoaded,
    error,
    bookingLoading,
  } = usePortalCliente(tenant);

  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const gridReady = !loading && openingHoursLoaded && courts.length > 0 && openingHours.length > 0;

  useEffect(() => {
    console.log('[PortalCliente] openingHours before grid render:', { loading, openingHoursLoaded, gridReady, openingHours });
  }, [loading, openingHoursLoaded, gridReady, openingHours]);

  const selectedCourt = courts.find((c) => c.id === selectedCourtId) ?? null;

  const weekStart = useMemo(() => startOfWeek(selectedWeek), [selectedWeek]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const isCurrentWeek = toISODate(weekStart) === toISODate(startOfWeek(new Date()));

  const courtSlots = useMemo(() => slots.filter((s) => s.court_id === selectedCourtId), [slots, selectedCourtId]);

  const hours = useMemo(() => {
    const set = new Set<number>();
    for (const row of openingHours) {
      if (!row.is_open) continue;
      const start = timeToHour(row.open_time);
      const end = timeToHour(row.close_time);
      for (let h = start; h < end; h++) set.add(h);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [openingHours]);

  function isWithinOpeningHours(weekday: number, hour: number): boolean {
    const row = findOpeningHours(openingHours, weekday);
    if (!row || !row.is_open) return false;
    return hour >= timeToHour(row.open_time) && hour < timeToHour(row.close_time);
  }

  function cellStatus(date: Date, hour: number): CellStatus {
    const weekday = date.getDay();
    if (!isWithinOpeningHours(weekday, hour)) return 'closed';

    const startTime = hourTime(hour);
    const hasSlot = courtSlots.some((s) => s.weekday === weekday && s.start_time.slice(0, 5) === startTime.slice(0, 5));
    if (!hasSlot) return 'no-slot';

    const dateISO = toISODate(date);
    const isBooked = bookings.some(
      (b) => b.court_id === selectedCourtId && b.date === dateISO && b.start_time.slice(0, 5) === startTime.slice(0, 5),
    );
    return isBooked ? 'occupied' : 'available';
  }

  function openSlot(date: Date, hour: number, status: CellStatus) {
    if (status !== 'available' || !selectedCourt) return;
    setConfirmError(null);
    setNotes('');
    setSelectedSlot({ court: selectedCourt, date, hour });
  }

  function closeSlot() {
    setSelectedSlot(null);
    setConfirmError(null);
  }

  async function handleConfirm() {
    if (!selectedSlot) return;
    setConfirmError(null);
    try {
      await createBooking(
        selectedSlot.court.id,
        toISODate(selectedSlot.date),
        hourTime(selectedSlot.hour),
        hourTime(selectedSlot.hour + 1),
        notes,
      );
      closeSlot();
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Erro ao confirmar reserva');
    }
  }

  if (tenantLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-gray-200)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (tenantError || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <AlertCircle size={28} strokeWidth={1.5} color="var(--color-error)" />
        <span className="text-[15px] text-[var(--color-dark)]">{tenantError ?? 'Arena não encontrada'}</span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-6">
      {error && (
        <Card className="flex items-center gap-2.5 text-[var(--color-error-text)]">
          <AlertCircle size={18} strokeWidth={1.5} />
          <span className="text-sm">{error}</span>
        </Card>
      )}

      <div>
        <div className="mb-4 text-[15px] text-[var(--color-dark)]">Escolha a quadra</div>
        {loading ? (
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} className="h-[220px] w-[220px] shrink-0" />
            ))}
          </div>
        ) : courts.length === 0 ? (
          <Card className="py-10 text-center text-sm text-[var(--color-gray-400)]">Nenhuma quadra disponível no momento.</Card>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {courts.map((court) => {
              const isSelected = selectedCourtId === court.id;
              return (
                <div
                  key={court.id}
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
                    <Badge status="info">{court.sport_type}</Badge>
                    <div className="my-2.5 text-[13px] text-[var(--color-gray-600)]">{formatPrice(court.price_per_hour)}/h</div>
                    <Button
                      variant={isSelected ? 'primary' : 'secondary'}
                      className="w-full px-2 py-2 text-[13px]"
                      onClick={() => setSelectedCourtId(court.id)}
                    >
                      {isSelected ? 'Selecionada' : 'Selecionar'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedCourt && !gridReady && (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-gray-200)] border-t-[var(--color-primary)]" />
        </div>
      )}

      {selectedCourt && gridReady && (
        <>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedWeek(addDays(weekStart, -7))}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] bg-white"
              aria-label="Semana anterior"
            >
              <ChevronLeft size={16} strokeWidth={1.5} color="var(--color-dark)" />
            </button>
            <span className="text-sm text-[var(--color-dark)]">
              {formatDateShort(weekStart)} – {formatDateShort(addDays(weekStart, 6))}
            </span>
            {isCurrentWeek && <Badge status="info">Semana atual</Badge>}
            <button
              onClick={() => setSelectedWeek(addDays(weekStart, 7))}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] bg-white"
              aria-label="Próxima semana"
            >
              <ChevronRight size={16} strokeWidth={1.5} color="var(--color-dark)" />
            </button>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-gray-200)]">
            <div className="grid grid-cols-[80px_repeat(7,1fr)]">
              <div className="bg-[var(--color-gray-100)] p-2.5" />
              {weekDays.map((d) => {
                const dayClosed = !findOpeningHours(openingHours, d.getDay())?.is_open;
                return (
                  <div
                    key={d.toISOString()}
                    className="border-l border-[var(--color-gray-200)] bg-[var(--color-gray-100)] p-2.5 text-center"
                  >
                    <div className="text-xs text-[var(--color-dark)]">{weekdayLabels[d.getDay()]}</div>
                    <div className="text-[11px] text-[var(--color-gray-400)]">
                      {dayClosed ? 'Fechado' : formatDateShort(d)}
                    </div>
                  </div>
                );
              })}
            </div>
            {hours.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--color-gray-400)]">Nenhum horário configurado para esta quadra.</div>
            ) : (
              hours.map((hour) => (
                <div key={hour} className="grid grid-cols-[80px_repeat(7,1fr)] border-t border-[var(--color-gray-200)]">
                  <div className="border-r border-[var(--color-gray-200)] p-2 text-xs text-[var(--color-gray-400)]">
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  {weekDays.map((d) => {
                    const status = cellStatus(d, hour);
                    const bg =
                      status === 'available'
                        ? 'var(--color-success-bg)'
                        : status === 'occupied'
                          ? 'var(--color-gray-100)'
                          : status === 'closed'
                            ? 'var(--color-gray-200)'
                            : 'var(--color-gray-50)';
                    const color = status === 'available' ? 'var(--color-success-text)' : 'var(--color-gray-400)';
                    const label =
                      status === 'available' ? 'Disponível' : status === 'occupied' ? 'Ocupado' : status === 'closed' ? '—' : '';
                    return (
                      <div
                        key={`${d.toISOString()}-${hour}`}
                        onClick={() => openSlot(d, hour, status)}
                        className="border-l border-[var(--color-gray-200)] p-2 text-center"
                        style={{ backgroundColor: bg, cursor: status === 'available' ? 'pointer' : 'default' }}
                      >
                        <span className="text-[11px]" style={{ color }}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
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
              <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[var(--color-gray-200)]" />
              Fora do horário de funcionamento
            </span>
          </div>
        </>
      )}

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
                  {selectedSlot.court.name} · {selectedSlot.court.sport_type}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar size={16} strokeWidth={1.5} color="var(--color-gray-600)" />
                <span className="text-sm text-[var(--color-dark)]">{formatDateFull(selectedSlot.date)}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={16} strokeWidth={1.5} color="var(--color-gray-600)" />
                <span className="text-sm text-[var(--color-dark)]">
                  {String(selectedSlot.hour).padStart(2, '0')}:00 – {String(selectedSlot.hour + 1).padStart(2, '0')}:00
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Timer size={16} strokeWidth={1.5} color="var(--color-gray-600)" />
                <span className="text-sm text-[var(--color-dark)]">1 hora</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Wallet size={16} strokeWidth={1.5} color="var(--color-gray-600)" />
                <span className="text-sm text-[var(--color-dark)]">{formatPrice(selectedSlot.court.price_per_hour)}</span>
              </div>
            </div>

            <div className="mb-5 border-t border-[var(--color-gray-200)]" />

            {user ? (
              <>
                <label className="mb-1.5 block text-[13px] text-[var(--color-dark)]">Observação para a arena</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: chegaremos 10 minutos antes"
                  className="mb-5 h-[72px] resize-none rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[var(--color-dark)] placeholder:text-[var(--color-gray-400)] outline-none focus:border-[1.5px] focus:border-[var(--color-primary)]"
                />

                {confirmError && <span className="mb-3 block text-[12px] text-[var(--color-error)]">{confirmError}</span>}

                <Button variant="primary" className="w-full" onClick={handleConfirm} disabled={bookingLoading}>
                  {bookingLoading ? 'Confirmando...' : 'Confirmar reserva'}
                </Button>

                <div className="mt-3 flex items-start gap-1.5">
                  <Info size={14} strokeWidth={1.5} color="var(--color-gray-400)" className="mt-0.5 shrink-0" />
                  <span className="text-xs leading-relaxed text-[var(--color-gray-400)]">
                    Esta reserva precisa de aprovação da arena. Você será notificado por email.
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <LogIn size={22} strokeWidth={1.5} color="var(--color-gray-600)" />
                <span className="text-sm text-[var(--color-dark)]">Faça login para reservar</span>
                <Button variant="primary" className="w-full" onClick={() => navigate(`/${slug}/login`)}>
                  Fazer login
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
