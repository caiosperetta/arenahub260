import { motion } from 'framer-motion';
import { Search, Download, Plus, Eye, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAdminHeader } from '../layouts/AdminHeaderContext';
import { useReservas } from '../hooks/useReservas';
import type { BookingStatus, BookingWithRelations } from '../types';

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

function getTodayISODate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function exportBookingsToCSV(bookings: BookingWithRelations[]) {
  const header = ['Cliente', 'Quadra', 'Data', 'Horário', 'Valor', 'Status'];
  const rows = bookings.map((b) => [
    b.client_full_name,
    b.court_name,
    formatDate(b.date),
    `${formatTime(b.start_time)} - ${formatTime(b.end_time)}`,
    formatCurrency(b.price),
    statusBadge[b.status].label,
  ]);

  const csvContent = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `reservas-${getTodayISODate()}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

const statusOptions: { value: BookingStatus; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'rejected', label: 'Recusado' },
];

const statusBadge: Record<BookingStatus, { status: 'confirmed' | 'pending' | 'cancelled'; label: string }> = {
  confirmed: { status: 'confirmed', label: 'Confirmado' },
  pending: { status: 'pending', label: 'Pendente' },
  cancelled: { status: 'cancelled', label: 'Cancelado' },
  rejected: { status: 'cancelled', label: 'Recusado' },
};

const gridCols = 'grid-cols-[1.3fr_1fr_0.85fr_1.1fr_0.65fr_0.75fr_0.85fr_0.6fr]';

function BookingSkeletonRow({ index }: { index: number }) {
  return (
    <div className={`grid ${gridCols} items-center px-5 py-3.5 ${index > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-gray-100)]" />
      ))}
    </div>
  );
}

function BookingRow({ booking }: { booking: BookingWithRelations }) {
  const badge = statusBadge[booking.status];
  return (
    <div className={`grid ${gridCols} items-center px-5 py-3.5`}>
      <span className="text-sm text-[var(--color-dark)]">{booking.client_full_name}</span>
      <span className="text-sm text-[var(--color-gray-600)]">{booking.court_name}</span>
      <span className="text-sm text-[var(--color-gray-600)]">{formatDate(booking.date)}</span>
      <span className="text-sm text-[var(--color-gray-600)]">
        {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
      </span>
      <span className="text-sm text-[var(--color-gray-600)]">{formatDuration(booking.start_time, booking.end_time)}</span>
      <span className="text-sm text-[var(--color-gray-600)]">{formatCurrency(booking.price)}</span>
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-fit"
      >
        <Badge status={badge.status} className="w-fit">
          {badge.label}
        </Badge>
      </motion.span>
      <div className="flex gap-3">
        <Link to={`/app/reservas/${booking.id}`} aria-label="Ver reserva">
          <Eye size={16} strokeWidth={1.5} color="var(--color-gray-600)" className="cursor-pointer" />
        </Link>
      </div>
    </div>
  );
}

export default function Reservas() {
  const { bookings, courts, loading, error, filters, setFilters } = useReservas();

  useAdminHeader({
    title: 'Reservas',
    subtitle: loading ? 'Carregando reservas...' : `${bookings.length} reserva${bookings.length === 1 ? '' : 's'} encontrada${bookings.length === 1 ? '' : 's'}`,
    action: (
      <Button variant="primary">
        <Plus size={16} strokeWidth={1.5} />
        Nova reserva
      </Button>
    ),
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
        <Card className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              strokeWidth={1.5}
              color="var(--color-gray-400)"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
            />
            <Input
              placeholder="Buscar por cliente ou quadra..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
            className="rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] bg-white px-3 py-2 text-[13px] text-[var(--color-dark)]"
          />
          <select
            value={filters.court_id}
            onChange={(e) => setFilters((prev) => ({ ...prev, court_id: e.target.value }))}
            className="rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] bg-white px-3 py-2 text-[13px] text-[var(--color-dark)]"
          >
            <option value="">Todas as quadras</option>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] bg-white px-3 py-2 text-[13px] text-[var(--color-dark)]"
          >
            <option value="">Todos os status</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            className="px-3.5 py-2 text-[13px]"
            disabled={bookings.length === 0}
            onClick={() => exportBookingsToCSV(bookings)}
          >
            <Download size={14} strokeWidth={1.5} />
            Exportar
          </Button>
        </Card>
      </motion.div>

      {error ? (
        <Card className="flex items-center gap-2.5 text-[var(--color-error-text)]">
          <AlertCircle size={18} strokeWidth={1.5} />
          <span className="text-sm">{error}</span>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className={`grid ${gridCols} border-b border-[var(--color-gray-200)] bg-[var(--color-gray-50)] px-5 py-3`}>
            <span className="text-xs font-medium text-[var(--color-gray-600)]">CLIENTE</span>
            <span className="text-xs font-medium text-[var(--color-gray-600)]">QUADRA</span>
            <span className="text-xs font-medium text-[var(--color-gray-600)]">DATA</span>
            <span className="text-xs font-medium text-[var(--color-gray-600)]">HORÁRIO</span>
            <span className="text-xs font-medium text-[var(--color-gray-600)]">DURAÇÃO</span>
            <span className="text-xs font-medium text-[var(--color-gray-600)]">VALOR</span>
            <span className="text-xs font-medium text-[var(--color-gray-600)]">STATUS</span>
            <span className="text-xs font-medium text-[var(--color-gray-600)]">AÇÕES</span>
          </div>

          {loading &&
            Array.from({ length: 6 }).map((_, i) => <BookingSkeletonRow key={i} index={i} />)}

          {!loading && bookings.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--color-gray-400)]">
              <Calendar size={24} strokeWidth={1.5} />
              <span className="text-sm">Nenhuma reserva encontrada</span>
            </div>
          )}

          {!loading &&
            bookings.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i, 20) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ backgroundColor: 'var(--color-gray-50)' }}
                className={i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}
              >
                <BookingRow booking={b} />
              </motion.div>
            ))}
        </Card>
      )}
    </motion.div>
  );
}
