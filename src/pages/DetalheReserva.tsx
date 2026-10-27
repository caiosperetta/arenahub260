import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { useAdminHeader } from '../layouts/AdminHeaderContext';
import { useReservaDetalhe } from '../hooks/useReservaDetalhe';
import type { BookingStatus } from '../types';

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

function formatDuration(startTime: string, endTime: string): string {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const totalMinutes = eh * 60 + em - (sh * 60 + sm);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, '0')}`;
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

const statusBadge: Record<BookingStatus, { status: 'confirmed' | 'pending' | 'cancelled'; label: string }> = {
  confirmed: { status: 'confirmed', label: 'Confirmado' },
  pending: { status: 'pending', label: 'Pendente' },
  cancelled: { status: 'cancelled', label: 'Cancelado' },
  rejected: { status: 'cancelled', label: 'Recusado' },
};

export default function DetalheReserva() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { booking, loading, error, updateStatus } = useReservaDetalhe(id);
  const [submitting, setSubmitting] = useState<'confirmed' | 'rejected' | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useAdminHeader({
    title: 'Detalhe da reserva',
  });

  async function handleUpdateStatus(status: 'confirmed' | 'rejected') {
    setSubmitting(status);
    try {
      await updateStatus(status);
      setSuccessMessage(status === 'confirmed' ? 'Reserva aprovada com sucesso!' : 'Reserva recusada.');
      setTimeout(() => navigate('/app/reservas'), 1500);
    } catch (err) {
      console.error('Erro ao atualizar reserva:', err);
      setSubmitting(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => navigate('/app/reservas')}
        className="flex w-fit items-center gap-2 text-sm text-[var(--color-gray-600)] hover:text-[var(--color-dark)]"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Voltar para reservas
      </button>

      {loading && (
        <Card className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded-full bg-[var(--color-gray-100)]" />
            <div className="flex flex-col gap-2">
              <div className="h-4 w-40 animate-pulse rounded bg-[var(--color-gray-100)]" />
              <div className="h-3 w-28 animate-pulse rounded bg-[var(--color-gray-100)]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-gray-100)]" />
            ))}
          </div>
        </Card>
      )}

      {!loading && error && (
        <Card className="flex items-center gap-2.5 text-[var(--color-error-text)]">
          <AlertCircle size={18} strokeWidth={1.5} />
          <span className="text-sm">{error}</span>
        </Card>
      )}

      {!loading && !error && !booking && (
        <Card className="flex items-center gap-2.5 text-[var(--color-gray-400)]">
          <AlertCircle size={18} strokeWidth={1.5} />
          <span className="text-sm">Reserva não encontrada.</span>
        </Card>
      )}

      {!loading && booking && (
        <Card className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-sm font-medium text-[var(--color-dark)]">
                {getInitials(booking.client_full_name)}
              </div>
              <div className="flex flex-col">
                <span className="text-base text-[var(--color-dark)]">{booking.client_full_name}</span>
                <span className="text-sm text-[var(--color-gray-400)]">{booking.client_phone ?? 'Sem telefone'}</span>
              </div>
            </div>
            <Badge status={statusBadge[booking.status].status}>{statusBadge[booking.status].label}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[var(--color-gray-100)] pt-5">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[var(--color-gray-400)]">Quadra</span>
              <span className="text-sm text-[var(--color-dark)]">
                {booking.court_name}
                {booking.court_sport_type ? ` · ${booking.court_sport_type}` : ''}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[var(--color-gray-400)]">Data</span>
              <span className="text-sm text-[var(--color-dark)]">{formatDate(booking.date)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[var(--color-gray-400)]">Horário</span>
              <span className="text-sm text-[var(--color-dark)]">
                {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[var(--color-gray-400)]">Duração</span>
              <span className="text-sm text-[var(--color-dark)]">{formatDuration(booking.start_time, booking.end_time)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[var(--color-gray-400)]">Valor</span>
              <span className="text-sm text-[var(--color-dark)]">{formatCurrency(booking.price)}</span>
            </div>
          </div>

          {booking.notes && (
            <div className="flex flex-col gap-1 border-t border-[var(--color-gray-100)] pt-5">
              <span className="text-xs text-[var(--color-gray-400)]">Observações</span>
              <span className="text-sm text-[var(--color-dark)]">{booking.notes}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] px-4 py-2.5 text-sm text-[var(--color-success-text)]">
              <CheckCircle2 size={16} strokeWidth={1.5} />
              {successMessage}
            </div>
          )}

          {booking.status === 'pending' && !successMessage && (
            <div className="flex gap-3 border-t border-[var(--color-gray-100)] pt-5">
              <Button
                variant="primary"
                disabled={submitting !== null}
                onClick={() => handleUpdateStatus('confirmed')}
              >
                {submitting === 'confirmed' ? 'Aprovando...' : 'Aprovar'}
              </Button>
              <Button
                variant="ghost-destructive"
                disabled={submitting !== null}
                onClick={() => handleUpdateStatus('rejected')}
              >
                {submitting === 'rejected' ? 'Recusando...' : 'Recusar'}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
