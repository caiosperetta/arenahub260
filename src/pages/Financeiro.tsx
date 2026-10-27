import { TrendingUp, Clock, CalendarCheck, BarChart2, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import MetricCard from '../components/MetricCard';
import { SkeletonMetricCard } from '../components/Skeletons';
import { useAdminHeader } from '../layouts/AdminHeaderContext';
import { useFinanceiro } from '../hooks/useFinanceiro';
import type { BookingStatus, BookingWithRelations, FinanceiroPeriod } from '../types';

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

const periodOptions: { value: FinanceiroPeriod; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: '7dias', label: '7 dias' },
  { value: '30dias', label: '30 dias' },
  { value: '3meses', label: '3 meses' },
];

const statusBadge: Record<BookingStatus, { status: 'confirmed' | 'pending' | 'cancelled'; label: string }> = {
  confirmed: { status: 'confirmed', label: 'Confirmado' },
  pending: { status: 'pending', label: 'Pendente' },
  cancelled: { status: 'cancelled', label: 'Cancelado' },
  rejected: { status: 'cancelled', label: 'Recusado' },
};

const txGridCols = 'grid-cols-[1.3fr_1fr_0.9fr_0.8fr_0.9fr_0.9fr]';

function PeriodSelector({ period, onChange }: { period: FinanceiroPeriod; onChange: (p: FinanceiroPeriod) => void }) {
  return (
    <div className="flex gap-2">
      {periodOptions.map((opt) => {
        const active = opt.value === period;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              active
                ? 'rounded-[var(--radius-md)] bg-[#22C55E] px-4 py-2 text-sm font-medium text-white transition-colors'
                : 'rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] px-4 py-2 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[var(--color-gray-50)]'
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function TransactionSkeletonRow({ index }: { index: number }) {
  return (
    <div className={`grid ${txGridCols} items-center px-5 py-3.5 ${index > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-gray-100)]" />
      ))}
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: BookingWithRelations }) {
  const badge = statusBadge[transaction.status];
  return (
    <div className={`grid ${txGridCols} items-center px-5 py-3.5`}>
      <span className="text-sm text-[var(--color-dark)]">{transaction.client_full_name}</span>
      <span className="text-sm text-[var(--color-gray-600)]">{transaction.court_name}</span>
      <span className="text-sm text-[var(--color-gray-600)]">{formatDate(transaction.date)}</span>
      <span className="text-sm text-[var(--color-gray-600)]">{formatTime(transaction.start_time)}</span>
      <span className="text-sm text-[var(--color-dark)]">{formatCurrency(transaction.price)}</span>
      <Badge status={badge.status} className="w-fit">
        {badge.label}
      </Badge>
    </div>
  );
}

function OverdueSkeletonRow({ index }: { index: number }) {
  return (
    <div className={`py-3 ${index > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}>
      <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-[var(--color-gray-100)]" />
      <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--color-gray-100)]" />
    </div>
  );
}

function OverdueRow({ booking }: { booking: BookingWithRelations }) {
  return (
    <div className="py-3">
      <div className="mb-1 flex justify-between">
        <span className="text-sm text-[var(--color-dark)]">{booking.client_full_name}</span>
        <span className="text-sm font-medium text-[var(--color-error-text)]">{formatCurrency(booking.price)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-gray-400)]">
          {booking.court_name} · {formatDate(booking.date)}
        </span>
        <Button
          variant="ghost"
          className="px-2.5 py-1.5 text-[11px]"
          onClick={() => alert('Funcionalidade em breve')}
        >
          Lembrar
        </Button>
      </div>
    </div>
  );
}

export default function Financeiro() {
  const { metrics, transactions, overdueClients, period, setPeriod, loading, error } = useFinanceiro();

  useAdminHeader({
    title: 'Financeiro',
    action: <PeriodSelector period={period} onChange={setPeriod} />,
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonMetricCard key={i} />)
        ) : (
          <>
            <MetricCard
              icon={TrendingUp}
              iconColor="var(--color-cyan)"
              iconBg="rgba(6,182,212,0.12)"
              label="Receita confirmada"
              value={formatCurrency(metrics.confirmedRevenue)}
            />
            <MetricCard
              icon={Clock}
              iconColor="#EAB308"
              iconBg="var(--color-warning-bg)"
              label="Receita pendente"
              value={formatCurrency(metrics.pendingRevenue)}
            />
            <MetricCard
              icon={CalendarCheck}
              iconColor="var(--color-primary)"
              iconBg="var(--color-primary-light)"
              label="Total de reservas"
              value={String(metrics.totalBookings)}
            />
            <MetricCard
              icon={BarChart2}
              iconColor="var(--color-cyan)"
              iconBg="rgba(6,182,212,0.12)"
              label="Ticket médio"
              value={formatCurrency(metrics.averageTicket)}
            />
          </>
        )}
      </div>

      {error ? (
        <Card className="flex items-center gap-2.5 text-[var(--color-error-text)]">
          <AlertCircle size={18} strokeWidth={1.5} />
          <span className="text-sm">{error}</span>
        </Card>
      ) : (
        <div className="flex gap-5">
          <Card className="w-[60%] overflow-hidden p-0">
            <div className="border-b border-[var(--color-gray-200)] px-5 py-4 text-[15px] text-[var(--color-dark)]">
              Transações
            </div>
            <div className={`grid ${txGridCols} border-b border-[var(--color-gray-200)] bg-[var(--color-gray-50)] px-5 py-2.5`}>
              <span className="text-[11px] font-medium text-[var(--color-gray-600)]">CLIENTE</span>
              <span className="text-[11px] font-medium text-[var(--color-gray-600)]">QUADRA</span>
              <span className="text-[11px] font-medium text-[var(--color-gray-600)]">DATA</span>
              <span className="text-[11px] font-medium text-[var(--color-gray-600)]">HORÁRIO</span>
              <span className="text-[11px] font-medium text-[var(--color-gray-600)]">VALOR</span>
              <span className="text-[11px] font-medium text-[var(--color-gray-600)]">STATUS</span>
            </div>

            {loading && Array.from({ length: 6 }).map((_, i) => <TransactionSkeletonRow key={i} index={i} />)}

            {!loading && transactions.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--color-gray-400)]">
                <span className="text-sm">Nenhuma transação no período</span>
              </div>
            )}

            {!loading &&
              transactions.map((t, i) => (
                <div key={t.id} className={i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}>
                  <TransactionRow transaction={t} />
                </div>
              ))}
          </Card>

          <Card className="w-[40%]">
            <div className="mb-4 text-[15px] text-[var(--color-dark)]">Aguardando pagamento</div>
            <div className="flex flex-col">
              {loading && Array.from({ length: 4 }).map((_, i) => <OverdueSkeletonRow key={i} index={i} />)}

              {!loading && overdueClients.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--color-gray-400)]">
                  <CheckCircle size={24} strokeWidth={1.5} />
                  <span className="text-sm">Nenhum pagamento pendente</span>
                </div>
              )}

              {!loading &&
                overdueClients.map((o, i) => (
                  <div key={o.id} className={i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}>
                    <OverdueRow booking={o} />
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
