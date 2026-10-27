import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, CalendarX, AlertCircle } from 'lucide-react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import { cn } from '../lib/cn';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTenantBySlug } from '../hooks/useTenantBySlug';
import type { BookingStatus } from '../types';

type TabKey = 'proximas' | 'anteriores' | 'canceladas';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'proximas', label: 'Próximas' },
  { key: 'anteriores', label: 'Anteriores' },
  { key: 'canceladas', label: 'Canceladas' },
];

const badgeByStatus: Record<BookingStatus, { status: 'confirmed' | 'pending' | 'cancelled'; label: string }> = {
  confirmed: { status: 'confirmed', label: 'Confirmado' },
  pending: { status: 'pending', label: 'Pendente' },
  cancelled: { status: 'cancelled', label: 'Cancelada' },
  rejected: { status: 'cancelled', label: 'Rejeitada' },
};

interface BookingRow {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  courts: { name: string; sport_type: string } | null;
}

function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export default function MinhasReservas() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { tenant, loading: tenantLoading, error: tenantError } = useTenantBySlug(slug);

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('proximas');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = useCallback(() => setRefetchIndex((i) => i + 1), []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate(`/${slug}/login`, { replace: true });
  }, [authLoading, user, slug, navigate]);

  useEffect(() => {
    if (!tenant || !user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('id, date, start_time, end_time, status, courts(name, sport_type)')
        .eq('tenant_id', tenant!.id)
        .eq('client_id', user!.id)
        .order('date', { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setBookings((data ?? []) as unknown as BookingRow[]);
      }
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [tenant, user, refetchIndex]);

  async function handleCancel(bookingId: string) {
    if (!window.confirm('Cancelar esta reserva?')) return;
    setCancellingId(bookingId);
    try {
      const { error: updateError } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
      if (updateError) throw updateError;
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar reserva');
    } finally {
      setCancellingId(null);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-gray-200)] border-t-[var(--color-primary)]" />
      </div>
    );
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

  const today = todayISO();
  const isPast = (date: string) => date < today;
  const isFuture = (date: string) => date >= today;
  const isOpen = (status: BookingStatus) => status === 'confirmed' || status === 'pending';
  const isClosed = (status: BookingStatus) => status === 'cancelled' || status === 'rejected';

  const bookingsByTab: Record<TabKey, BookingRow[]> = {
    proximas: bookings.filter((b) => isFuture(b.date) && isOpen(b.status)),
    anteriores: bookings.filter((b) => isPast(b.date) && isOpen(b.status)),
    canceladas: bookings.filter((b) => isClosed(b.status)),
  };

  const visibleBookings = bookingsByTab[activeTab];

  return (
    <div className="-mx-12 bg-[var(--color-gray-100)] px-12 pb-16 pt-10">
      <h1 className="mb-6 text-2xl text-[var(--color-dark)]">Minhas reservas</h1>

      {error && (
        <Card className="mb-5 flex items-center gap-2.5 text-[var(--color-error-text)]">
          <AlertCircle size={18} strokeWidth={1.5} />
          <span className="text-sm">{error}</span>
        </Card>
      )}

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
            {tab.label} ({bookingsByTab[tab.key].length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[76px] animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-gray-200)]" />
          ))}
        </div>
      ) : visibleBookings.length > 0 ? (
        <div className="flex flex-col gap-3">
          {visibleBookings.map((b) => {
            const badge = badgeByStatus[b.status];
            const showCancel = activeTab === 'proximas' && b.status === 'pending';
            return (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-gray-200)] bg-white px-5 py-4.5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--color-gray-100)]">
                    <MapPin size={18} strokeWidth={1.5} color="var(--color-gray-600)" />
                  </div>
                  <div>
                    <div className="text-[15px] text-[var(--color-dark)]">
                      {b.courts?.name ?? 'Quadra'} · {b.courts?.sport_type ?? ''}
                    </div>
                    <div className="mt-0.5 text-[13px] text-[var(--color-gray-600)]">
                      {formatDateBR(b.date)} · {b.start_time.slice(0, 5)} – {b.end_time.slice(0, 5)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge status={badge.status}>{badge.label}</Badge>
                  {showCancel && (
                    <Button
                      variant="ghost-destructive"
                      className="px-3.5 py-1.5 text-xs"
                      disabled={cancellingId === b.id}
                      onClick={() => handleCancel(b.id)}
                    >
                      {cancellingId === b.id ? 'Cancelando...' : 'Cancelar'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-gray-200)] bg-white py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-gray-100)]">
            <CalendarX size={24} strokeWidth={1.5} color="var(--color-gray-400)" />
          </div>
          <div className="text-[15px] text-[var(--color-dark)]">Nenhuma reserva {activeTab === 'canceladas' ? 'cancelada' : activeTab === 'anteriores' ? 'anterior' : 'futura'}</div>
          <div className="text-[13px] text-[var(--color-gray-600)]">Reservas que se encaixarem aqui aparecerão nesta lista.</div>
        </div>
      )}
    </div>
  );
}
