import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  CalendarCheck,
  Activity,
  Users,
  Bell,
  Plus,
  AlertCircle,
  X,
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import MetricCard from '../components/MetricCard';
import { SkeletonMetricCard, SkeletonCard } from '../components/Skeletons';
import { useAdminHeader } from '../layouts/AdminHeaderContext';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { useQuadras } from '../hooks/useQuadras';
import { supabase } from '../lib/supabase';
import { staggerContainer, fadeInUp } from '../lib/motion';
import type { BookingWithRelations } from '../types';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getHeaderDate(): string {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(now);
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${capitalizedWeekday}, ${dd}/${mm}/${now.getFullYear()}`;
}

function getTodayISODate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getWeekday(dateISO: string): number {
  const [y, m, d] = dateISO.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

function addHour(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const newHour = (h + 1) % 24;
  return `${String(newHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function selectClassName() {
  return 'w-full rounded-[var(--radius-sm)] border-[0.5px] border-[#CBD5E1] bg-white px-[14px] py-[10px] text-sm text-[var(--color-dark)] outline-none transition-colors focus:border-[1.5px] focus:border-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed';
}

interface NovaReservaForm {
  clientName: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

const emptyNovaReservaForm: NovaReservaForm = {
  clientName: '',
  courtId: '',
  date: getTodayISODate(),
  startTime: '',
  endTime: '',
  notes: '',
};

function BookingRow({ booking }: { booking: BookingWithRelations }) {
  return (
    <div>
      <div className="text-sm text-[var(--color-dark)]">{booking.client_full_name}</div>
      <div className="text-xs text-[var(--color-gray-400)]">
        {booking.court_name} · {formatDate(booking.date)} {formatTime(booking.start_time)}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile, tenant, user } = useAuth();
  const { metrics, upcomingBookings, pendingBookings, courtOccupancy, loading, error, refetch } = useDashboard();
  const { courts, slots } = useQuadras();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [showNovaReserva, setShowNovaReserva] = useState(false);
  const [form, setForm] = useState<NovaReservaForm>(emptyNovaReservaForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openNovaReserva() {
    setForm(emptyNovaReservaForm);
    setFormError(null);
    setShowNovaReserva(true);
  }

  function closeNovaReserva() {
    setShowNovaReserva(false);
    setFormError(null);
  }

  useAdminHeader({
    title: `${getGreeting()}, ${profile?.full_name?.split(' ')[0] ?? ''}`,
    subtitle: `${tenant?.name ?? ''} · ${getHeaderDate()}`,
    action: (
      <div className="flex items-center gap-5">
        <Bell size={20} strokeWidth={1.5} color="var(--color-gray-600)" />
        <Button variant="primary" onClick={openNovaReserva}>
          <Plus size={16} strokeWidth={1.5} />
          Nova reserva
        </Button>
      </div>
    ),
  });

  const availableStartTimes = useMemo(() => {
    if (!form.courtId || !form.date) return [];
    const weekday = getWeekday(form.date);
    const courtSlots = slots[form.courtId] ?? [];
    const times = Array.from(
      new Set(courtSlots.filter((s) => s.weekday === weekday).map((s) => s.start_time)),
    );
    return times.sort();
  }, [form.courtId, form.date, slots]);

  async function handleUpdateStatus(booking: BookingWithRelations, status: 'confirmed' | 'rejected') {
    setProcessingId(booking.id);
    try {
      const { error: updateError } = await supabase.from('bookings').update({ status }).eq('id', booking.id);
      if (updateError) throw updateError;
      await refetch();
    } catch (err) {
      console.error('Erro ao atualizar reserva:', err);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleSubmitNovaReserva(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const tenantId = profile?.tenant_id;
    const clientId = user?.id;
    const court = courts.find((c) => c.id === form.courtId);

    if (!tenantId || !clientId) {
      setFormError('Não foi possível identificar a arena ou o usuário atual.');
      return;
    }
    if (!court) {
      setFormError('Selecione uma quadra.');
      return;
    }
    if (!form.date || form.date < getTodayISODate()) {
      setFormError('Selecione uma data válida.');
      return;
    }
    if (!form.startTime) {
      setFormError('Selecione o horário de início.');
      return;
    }
    if (!form.endTime) {
      setFormError('Selecione o horário de término.');
      return;
    }

    const notes = [form.clientName.trim() ? `Cliente: ${form.clientName.trim()}` : null, form.notes.trim() || null]
      .filter(Boolean)
      .join('\n');

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('bookings').insert({
        tenant_id: tenantId,
        court_id: form.courtId,
        client_id: clientId,
        date: form.date,
        start_time: form.startTime,
        end_time: form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime,
        status: 'pending',
        notes: notes || null,
        price: court.price_per_hour,
      });

      if (insertError) throw insertError;

      closeNovaReserva();
      await refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao criar reserva');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </div>
        <div className="flex gap-5">
          <SkeletonCard className="h-48 w-[60%]" />
          <SkeletonCard className="h-48 w-[40%]" />
        </div>
        <div className="flex gap-5">
          <SkeletonCard className="h-48 w-[60%]" />
          <SkeletonCard className="h-48 w-[40%]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="flex items-center gap-2.5 text-[var(--color-error-text)]">
        <AlertCircle size={18} strokeWidth={1.5} />
        <span className="text-sm">{error}</span>
      </Card>
    );
  }

  const maxCourtBookings = Math.max(1, ...courtOccupancy.map((c) => c.bookings_count));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5"
    >
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        animate="show"
        className="grid grid-cols-4 gap-4"
      >
        <motion.div variants={fadeInUp}>
          <MetricCard
            icon={TrendingUp}
            iconColor="var(--color-cyan)"
            iconBg="rgba(6,182,212,0.12)"
            label="Receita hoje"
            value={formatCurrency(metrics?.revenueToday ?? 0)}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <MetricCard
            icon={CalendarCheck}
            iconColor="var(--color-primary)"
            iconBg="var(--color-primary-light)"
            label="Reservas"
            value={String(metrics?.totalBookingsToday ?? 0)}
            trend={`${metrics?.pendingBookings ?? 0} pendentes`}
            trendType="warning"
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <MetricCard
            icon={Activity}
            iconColor="var(--color-cyan)"
            iconBg="rgba(6,182,212,0.12)"
            label="Ocupação"
            value={`${metrics?.occupancyPct ?? 0}%`}
            trend={`${courtOccupancy.length} quadras ativas`}
            trendType="neutral"
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <MetricCard
            icon={Users}
            iconColor="var(--color-primary)"
            iconBg="var(--color-primary-light)"
            label="Clientes ativos"
            value={String(metrics?.activeClients ?? 0)}
          />
        </motion.div>
      </motion.div>

      <div className="flex gap-5">
        <Card className="w-[60%]">
          <div className="mb-4 text-[15px] text-[var(--color-dark)]">Ocupação por quadra</div>
          <div className="flex flex-col gap-3.5">
            {courtOccupancy.length === 0 && (
              <span className="py-2.5 text-sm text-[var(--color-gray-400)]">Nenhuma quadra cadastrada.</span>
            )}
            {courtOccupancy.map((c, i) => (
              <div key={c.court_id} className="flex items-center gap-3">
                <span className="w-[160px] text-[13px] text-[var(--color-gray-600)]">{c.court_name}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-[4px] bg-[var(--color-gray-100)]">
                  <div
                    className="h-2.5 rounded-[4px]"
                    style={{
                      width: `${(c.bookings_count / maxCourtBookings) * 100}%`,
                      backgroundColor: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-cyan)',
                    }}
                  />
                </div>
                <span className="w-20 text-right text-[13px] text-[var(--color-dark)]">{c.bookings_count} reservas</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="w-[40%]">
          <div className="mb-4 text-[15px] text-[var(--color-dark)]">Próximas reservas</div>
          <div className="flex flex-col">
            {upcomingBookings.length === 0 && (
              <span className="py-2.5 text-sm text-[var(--color-gray-400)]">Nenhuma reserva agendada.</span>
            )}
            {upcomingBookings.map((r, i) => (
              <motion.div
                key={r.id}
                whileHover={{ backgroundColor: 'var(--color-gray-50)' }}
                transition={{ duration: 0.15 }}
                className={`flex items-center justify-between rounded-[var(--radius-sm)] px-2 py-2.5 ${i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}
              >
                <BookingRow booking={r} />
                <Badge status={r.status === 'confirmed' ? 'confirmed' : 'pending'}>
                  {r.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex gap-5">
        <Card className="w-[60%]">
          <div className="mb-4 text-[15px] text-[var(--color-dark)]">Reservas aguardando aprovação</div>
          <div className="flex flex-col">
            {pendingBookings.length === 0 && (
              <span className="py-2.5 text-sm text-[var(--color-gray-400)]">Nenhuma reserva pendente.</span>
            )}
            {pendingBookings.map((p, i) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -2, backgroundColor: 'var(--color-gray-50)' }}
                transition={{ duration: 0.15 }}
                className={`flex items-center justify-between rounded-[var(--radius-sm)] px-2 py-2.5 ${i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}
              >
                <BookingRow booking={p} />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="px-3.5 py-1.5 text-xs"
                    disabled={processingId === p.id}
                    onClick={() => handleUpdateStatus(p, 'confirmed')}
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="ghost-destructive"
                    className="px-3.5 py-1.5 text-xs"
                    disabled={processingId === p.id}
                    onClick={() => handleUpdateStatus(p, 'rejected')}
                  >
                    Recusar
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="w-[40%]">
          <div className="mb-4 text-[15px] text-[var(--color-dark)]">Avisos</div>
          <div className="flex flex-col">
            <span className="py-2.5 text-sm text-[var(--color-gray-400)]">Nenhum aviso no momento.</span>
          </div>
        </Card>
      </div>

      <AnimatePresence>
        {showNovaReserva && (
          <>
            <motion.div
              key="nova-reserva-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeNovaReserva}
              className="fixed inset-0 z-10 bg-[rgba(15,23,42,0.4)]"
            />
            <motion.div
              key="nova-reserva-panel"
              initial={{ x: 420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 z-20 flex w-[420px] flex-col overflow-y-auto bg-white p-8 shadow-[var(--shadow-modal)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-[22px] text-[var(--color-dark)]">Nova reserva</h2>
                <button onClick={closeNovaReserva} className="cursor-pointer border-none bg-transparent p-0" aria-label="Fechar">
                  <X size={18} strokeWidth={1.5} color="var(--color-gray-600)" />
                </button>
              </div>

              <form onSubmit={handleSubmitNovaReserva} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nr-client" className="text-[13px] text-[var(--color-dark)]">
                    Cliente
                  </label>
                  <Input
                    id="nr-client"
                    placeholder="Buscar por nome..."
                    value={form.clientName}
                    onChange={(e) => setForm((prev) => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nr-court" className="text-[13px] text-[var(--color-dark)]">
                    Quadra
                  </label>
                  <select
                    id="nr-court"
                    value={form.courtId}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, courtId: e.target.value, startTime: '', endTime: '' }))
                    }
                    className={selectClassName()}
                    required
                  >
                    <option value="">Selecione a quadra</option>
                    {courts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nr-date" className="text-[13px] text-[var(--color-dark)]">
                    Data
                  </label>
                  <input
                    id="nr-date"
                    type="date"
                    min={getTodayISODate()}
                    value={form.date}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value, startTime: '', endTime: '' }))}
                    className={selectClassName()}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="nr-start" className="text-[13px] text-[var(--color-dark)]">
                      Horário início
                    </label>
                    <select
                      id="nr-start"
                      value={form.startTime}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                          endTime: e.target.value ? addHour(e.target.value.slice(0, 5)) : '',
                        }))
                      }
                      className={selectClassName()}
                      disabled={!form.courtId || availableStartTimes.length === 0}
                      required
                    >
                      <option value="">{availableStartTimes.length === 0 ? 'Sem horários' : 'Selecione'}</option>
                      {availableStartTimes.map((t) => (
                        <option key={t} value={t}>
                          {t.slice(0, 5)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="nr-end" className="text-[13px] text-[var(--color-dark)]">
                      Horário fim
                    </label>
                    <input
                      id="nr-end"
                      type="time"
                      value={form.endTime.slice(0, 5)}
                      onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                      className={selectClassName()}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nr-notes" className="text-[13px] text-[var(--color-dark)]">
                    Observação
                  </label>
                  <textarea
                    id="nr-notes"
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Opcional"
                    className="h-[72px] resize-none rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[var(--color-dark)] placeholder:text-[var(--color-gray-400)] outline-none focus:border-[1.5px] focus:border-[var(--color-primary)]"
                  />
                </div>

                {formError && <span className="text-[12px] text-[var(--color-error)]">{formError}</span>}

                <div className="mt-2 flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={closeNovaReserva} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? 'Criando...' : 'Criar reserva'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
