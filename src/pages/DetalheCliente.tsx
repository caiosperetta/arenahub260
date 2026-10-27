import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CalendarCheck, CheckCircle2, Wallet } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import MetricCard from '../components/MetricCard';
import { useAdminHeader } from '../layouts/AdminHeaderContext';
import { useDetalheCliente } from '../hooks/useDetalheCliente';
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

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

const roleLabel: Record<string, string> = {
  super_admin: 'Super admin',
  admin: 'Administrador',
  staff: 'Equipe',
  client: 'Cliente',
};

const statusBadge: Record<BookingStatus, { status: 'confirmed' | 'pending' | 'cancelled'; label: string }> = {
  confirmed: { status: 'confirmed', label: 'Confirmado' },
  pending: { status: 'pending', label: 'Pendente' },
  cancelled: { status: 'cancelled', label: 'Cancelado' },
  rejected: { status: 'cancelled', label: 'Recusado' },
};

const weekdayLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const gridCols = 'grid-cols-[1.5fr_1fr_1.2fr_0.8fr_0.9fr]';

export default function DetalheCliente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { client, bookings, monthlyPlans, loading, error } = useDetalheCliente(id);

  useAdminHeader({
    title: 'Detalhe do cliente',
  });

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const totalSpent = confirmedBookings.reduce((sum, b) => sum + Number(b.price), 0);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => navigate('/app/clientes')}
        className="flex w-fit items-center gap-2 text-sm text-[var(--color-gray-600)] hover:text-[var(--color-dark)]"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Voltar para clientes
      </button>

      {loading && (
        <Card className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 animate-pulse rounded-full bg-[var(--color-gray-100)]" />
            <div className="flex flex-col gap-2">
              <div className="h-4 w-40 animate-pulse rounded bg-[var(--color-gray-100)]" />
              <div className="h-3 w-28 animate-pulse rounded bg-[var(--color-gray-100)]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
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

      {!loading && !error && !client && (
        <Card className="flex items-center gap-2.5 text-[var(--color-gray-400)]">
          <AlertCircle size={18} strokeWidth={1.5} />
          <span className="text-sm">Cliente não encontrado.</span>
        </Card>
      )}

      {!loading && client && (
        <>
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-base font-medium text-[var(--color-dark)]">
                {getInitials(client.full_name)}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-base text-[var(--color-dark)]">{client.full_name}</span>
                <span className="text-sm text-[var(--color-gray-400)]">{client.phone ?? 'Sem telefone'}</span>
                <span className="text-xs text-[var(--color-gray-400)]">
                  Cliente desde {formatDate(client.created_at)}
                </span>
              </div>
            </div>
            <Badge status="info">{roleLabel[client.role] ?? client.role}</Badge>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              icon={CalendarCheck}
              iconColor="var(--color-primary)"
              iconBg="var(--color-primary-light)"
              label="Total de reservas"
              value={String(bookings.length)}
            />
            <MetricCard
              icon={CheckCircle2}
              iconColor="var(--color-cyan)"
              iconBg="rgba(6,182,212,0.12)"
              label="Reservas confirmadas"
              value={String(confirmedBookings.length)}
            />
            <MetricCard
              icon={Wallet}
              iconColor="var(--color-primary)"
              iconBg="var(--color-primary-light)"
              label="Total gasto"
              value={formatCurrency(totalSpent)}
            />
          </div>

          <Card className="overflow-hidden p-0">
            <div className="px-5 py-3 text-[15px] text-[var(--color-dark)]">Reservas</div>
            <div className={`grid ${gridCols} border-y border-[var(--color-gray-200)] bg-[var(--color-gray-50)] px-5 py-3`}>
              <span className="text-xs font-medium text-[var(--color-gray-600)]">QUADRA</span>
              <span className="text-xs font-medium text-[var(--color-gray-600)]">DATA</span>
              <span className="text-xs font-medium text-[var(--color-gray-600)]">HORÁRIO</span>
              <span className="text-xs font-medium text-[var(--color-gray-600)]">VALOR</span>
              <span className="text-xs font-medium text-[var(--color-gray-600)]">STATUS</span>
            </div>

            {bookings.length === 0 && (
              <div className="flex items-center justify-center py-10 text-sm text-[var(--color-gray-400)]">
                Nenhuma reserva encontrada.
              </div>
            )}

            {bookings.map((b, i) => {
              const badge = statusBadge[b.status];
              return (
                <div
                  key={b.id}
                  className={`grid ${gridCols} items-center px-5 py-3.5 ${i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}
                >
                  <span className="text-sm text-[var(--color-dark)]">
                    {b.court_name}
                    {b.court_sport_type ? ` · ${b.court_sport_type}` : ''}
                  </span>
                  <span className="text-sm text-[var(--color-gray-600)]">{formatDate(b.date)}</span>
                  <span className="text-sm text-[var(--color-gray-600)]">
                    {formatTime(b.start_time)} – {formatTime(b.end_time)}
                  </span>
                  <span className="text-sm text-[var(--color-gray-600)]">{formatCurrency(b.price)}</span>
                  <Badge status={badge.status} className="w-fit">
                    {badge.label}
                  </Badge>
                </div>
              );
            })}
          </Card>

          {monthlyPlans.length > 0 && (
            <Card className="overflow-hidden p-0">
              <div className="px-5 py-3 text-[15px] text-[var(--color-dark)]">Planos mensais</div>
              <div className="grid grid-cols-[1.5fr_1fr_1.2fr_1fr_0.8fr] border-y border-[var(--color-gray-200)] bg-[var(--color-gray-50)] px-5 py-3">
                <span className="text-xs font-medium text-[var(--color-gray-600)]">QUADRA</span>
                <span className="text-xs font-medium text-[var(--color-gray-600)]">DIA DA SEMANA</span>
                <span className="text-xs font-medium text-[var(--color-gray-600)]">HORÁRIO</span>
                <span className="text-xs font-medium text-[var(--color-gray-600)]">VALOR/MÊS</span>
                <span className="text-xs font-medium text-[var(--color-gray-600)]">STATUS</span>
              </div>
              {monthlyPlans.map((p, i) => (
                <div
                  key={p.id}
                  className={`grid grid-cols-[1.5fr_1fr_1.2fr_1fr_0.8fr] items-center px-5 py-3.5 ${i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}
                >
                  <span className="text-sm text-[var(--color-dark)]">
                    {p.court_name}
                    {p.court_sport_type ? ` · ${p.court_sport_type}` : ''}
                  </span>
                  <span className="text-sm text-[var(--color-gray-600)]">{weekdayLabels[p.weekday]}</span>
                  <span className="text-sm text-[var(--color-gray-600)]">
                    {formatTime(p.start_time)} – {formatTime(p.end_time)}
                  </span>
                  <span className="text-sm text-[var(--color-gray-600)]">{formatCurrency(p.price_per_month)}</span>
                  <Badge status={p.active ? 'confirmed' : 'inactive'} className="w-fit">
                    {p.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
