import { Wallet, Clock, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import MetricCard from '../components/MetricCard';
import { useAdminHeader } from '../layouts/AdminHeaderContext';

interface Metric {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  trend: string;
  trendType: 'positive' | 'negative' | 'neutral';
}

const financeMetrics: Metric[] = [
  { icon: Wallet, iconColor: 'var(--color-cyan)', iconBg: 'rgba(6,182,212,0.12)', label: 'Receita do mês', value: 'R$18.420', trend: '+8% vs julho', trendType: 'positive' },
  { icon: Clock, iconColor: 'var(--color-cyan)', iconBg: 'rgba(6,182,212,0.12)', label: 'A receber', value: 'R$2.140', trend: '12 reservas', trendType: 'neutral' },
  { icon: AlertTriangle, iconColor: 'var(--color-error)', iconBg: 'var(--color-error-bg)', label: 'Inadimplência', value: 'R$960', trend: '4 clientes', trendType: 'negative' },
  { icon: TrendingUp, iconColor: 'var(--color-primary)', iconBg: 'var(--color-primary-light)', label: 'Ticket médio', value: 'R$76', trend: '+3% vs julho', trendType: 'positive' },
];

interface Transaction {
  date: string;
  client: string;
  court: string;
  desc: string;
  value: string;
  status: 'confirmed' | 'pending';
  label: string;
}

const transactions: Transaction[] = [
  { date: '07/08/2026', client: 'Maria Silva', court: 'Quadra 2', desc: 'Reserva avulsa', value: 'R$70', status: 'confirmed', label: 'Pago' },
  { date: '07/08/2026', client: 'Pedro Santos', court: 'Quadra 1', desc: 'Reserva avulsa', value: 'R$80', status: 'pending', label: 'Pendente' },
  { date: '06/08/2026', client: 'Fernanda Lima', court: 'Quadra 1', desc: 'Mensalidade agosto', value: 'R$320', status: 'confirmed', label: 'Pago' },
  { date: '06/08/2026', client: 'Carlos Rezende', court: 'Quadra 4', desc: 'Mensalidade agosto', value: 'R$280', status: 'confirmed', label: 'Pago' },
  { date: '05/08/2026', client: 'Lucas Almeida', court: 'Quadra 4', desc: 'Reserva avulsa', value: 'R$60', status: 'confirmed', label: 'Pago' },
  { date: '04/08/2026', client: 'Rafael Souza', court: 'Quadra 3', desc: 'Reserva avulsa', value: 'R$90', status: 'pending', label: 'Pendente' },
  { date: '02/08/2026', client: 'Beatriz Nunes', court: 'Quadra 2', desc: 'Reserva avulsa', value: 'R$70', status: 'pending', label: 'Pendente' },
];

const overdueClients = [
  { name: 'Pedro Santos', value: 'R$320', days: 5 },
  { name: 'Rafael Souza', value: 'R$280', days: 8 },
  { name: 'Beatriz Nunes', value: 'R$180', days: 3 },
  { name: 'João Prado', value: 'R$180', days: 12 },
];

const txGridCols = 'grid-cols-[0.9fr_1.4fr_1fr_1.4fr_0.9fr_0.9fr]';

export default function Financeiro() {
  useAdminHeader({
    title: 'Financeiro',
    subtitle: 'Agosto de 2026',
    action: (
      <Button variant="secondary">
        <Download size={16} strokeWidth={1.5} />
        Exportar relatório
      </Button>
    ),
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {financeMetrics.map((m) => (
          <MetricCard
            key={m.label}
            icon={m.icon}
            iconColor={m.iconColor}
            iconBg={m.iconBg}
            label={m.label}
            value={m.value}
            trend={m.trend}
            trendType={m.trendType}
          />
        ))}
      </div>

      <div className="flex gap-5">
        <Card className="w-[64%] overflow-hidden p-0">
          <div className="border-b border-[var(--color-gray-200)] px-5 py-4 text-[15px] text-[var(--color-dark)]">
            Transações recentes
          </div>
          <div className={`grid ${txGridCols} border-b border-[var(--color-gray-200)] bg-[var(--color-gray-50)] px-5 py-2.5`}>
            <span className="text-[11px] font-medium text-[var(--color-gray-600)]">DATA</span>
            <span className="text-[11px] font-medium text-[var(--color-gray-600)]">CLIENTE</span>
            <span className="text-[11px] font-medium text-[var(--color-gray-600)]">QUADRA</span>
            <span className="text-[11px] font-medium text-[var(--color-gray-600)]">DESCRIÇÃO</span>
            <span className="text-[11px] font-medium text-[var(--color-gray-600)]">VALOR</span>
            <span className="text-[11px] font-medium text-[var(--color-gray-600)]">STATUS</span>
          </div>
          {transactions.map((t, i) => (
            <div
              key={`${t.date}-${t.client}-${t.desc}`}
              className={`grid ${txGridCols} items-center px-5 py-3 ${i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}
            >
              <span className="text-[13px] text-[var(--color-gray-600)]">{t.date}</span>
              <span className="text-[13px] text-[var(--color-dark)]">{t.client}</span>
              <span className="text-[13px] text-[var(--color-gray-600)]">{t.court}</span>
              <span className="text-[13px] text-[var(--color-gray-600)]">{t.desc}</span>
              <span className="text-[13px] text-[var(--color-dark)]">{t.value}</span>
              <Badge status={t.status} className="w-fit">
                {t.label}
              </Badge>
            </div>
          ))}
        </Card>

        <Card className="w-[36%]">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={16} strokeWidth={1.5} color="var(--color-error-text)" />
            <div className="text-[15px] text-[var(--color-dark)]">Clientes inadimplentes</div>
          </div>
          <div className="flex flex-col">
            {overdueClients.map((o, i) => (
              <div key={o.name} className={`py-3 ${i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm text-[var(--color-dark)]">{o.name}</span>
                  <span className="text-sm font-medium text-[var(--color-error-text)]">{o.value}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-gray-400)]">{o.days} dias em atraso</span>
                  <Button variant="secondary" className="px-2.5 py-1.5 text-[11px]">
                    Enviar lembrete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
