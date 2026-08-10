import { useState } from 'react';
import {
  TrendingUp,
  CalendarCheck,
  Activity,
  Users,
  Bell,
  Plus,
  AlertCircle,
} from 'lucide-react';
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
  trendType: 'positive' | 'warning' | 'neutral';
}

const metrics: Metric[] = [
  {
    icon: TrendingUp,
    iconColor: 'var(--color-cyan)',
    iconBg: 'rgba(6,182,212,0.12)',
    label: 'Receita hoje',
    value: 'R$840',
    trend: '+12% vs ontem',
    trendType: 'positive',
  },
  {
    icon: CalendarCheck,
    iconColor: 'var(--color-primary)',
    iconBg: 'var(--color-primary-light)',
    label: 'Reservas',
    value: '14',
    trend: '3 pendentes',
    trendType: 'warning',
  },
  {
    icon: Activity,
    iconColor: 'var(--color-cyan)',
    iconBg: 'rgba(6,182,212,0.12)',
    label: 'Ocupação',
    value: '78%',
    trend: '4 quadras ativas',
    trendType: 'neutral',
  },
  {
    icon: Users,
    iconColor: 'var(--color-primary)',
    iconBg: 'var(--color-primary-light)',
    label: 'Clientes ativos',
    value: '127',
    trend: '+5 este mês',
    trendType: 'positive',
  },
];

const occupancyBars = [
  { name: 'Quadra 1 · Society', pct: 82, color: 'var(--color-primary)' },
  { name: 'Quadra 2 · Beach Tennis', pct: 65, color: 'var(--color-cyan)' },
  { name: 'Quadra 3 · Futsal', pct: 90, color: 'var(--color-primary)' },
  { name: 'Quadra 4 · Vôlei', pct: 48, color: 'var(--color-cyan)' },
];

const upcomingReservations: { client: string; court: string; time: string; status: 'confirmed' | 'pending'; label: string }[] = [
  { client: 'Maria Silva', court: 'Quadra 2', time: '19:00', status: 'confirmed', label: 'Confirmado' },
  { client: 'Pedro Santos', court: 'Quadra 1', time: '20:00', status: 'pending', label: 'Pendente' },
  { client: 'Ana Costa', court: 'Quadra 3', time: '21:00', status: 'confirmed', label: 'Confirmado' },
  { client: 'Lucas Almeida', court: 'Quadra 4', time: '22:00', status: 'confirmed', label: 'Confirmado' },
];

const initialApprovals = [
  { id: 1, client: 'Fernanda Lima', court: 'Quadra 1', time: 'Hoje, 18:00' },
  { id: 2, client: 'Rafael Souza', court: 'Quadra 3', time: 'Hoje, 20:00' },
  { id: 3, client: 'Beatriz Nunes', court: 'Quadra 2', time: 'Amanhã, 09:00' },
];

const alerts = [
  'Cliente Pedro Santos está com mensalidade em atraso há 5 dias.',
  'Quadra 4 bloqueada para manutenção até 10/08.',
];

export default function Dashboard() {
  const [approvals, setApprovals] = useState(initialApprovals);

  useAdminHeader({
    title: 'Bom dia, João',
    subtitle: 'Arena Rossato · Quinta, 07/08/2026',
    action: (
      <div className="flex items-center gap-5">
        <Bell size={20} strokeWidth={1.5} color="var(--color-gray-600)" />
        <Button variant="primary">
          <Plus size={16} strokeWidth={1.5} />
          Nova reserva
        </Button>
      </div>
    ),
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((m) => (
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
        <Card className="w-[60%]">
          <div className="mb-4 text-[15px] text-[var(--color-dark)]">Ocupação por quadra</div>
          <div className="flex flex-col gap-3.5">
            {occupancyBars.map((b) => (
              <div key={b.name} className="flex items-center gap-3">
                <span className="w-[160px] text-[13px] text-[var(--color-gray-600)]">{b.name}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-[4px] bg-[var(--color-gray-100)]">
                  <div
                    className="h-2.5 rounded-[4px]"
                    style={{ width: `${b.pct}%`, backgroundColor: b.color }}
                  />
                </div>
                <span className="w-9 text-right text-[13px] text-[var(--color-dark)]">{b.pct}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="w-[40%]">
          <div className="mb-4 text-[15px] text-[var(--color-dark)]">Próximas reservas</div>
          <div className="flex flex-col">
            {upcomingReservations.map((r, i) => (
              <div
                key={`${r.client}-${r.time}`}
                className={`flex items-center justify-between py-2.5 ${i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}
              >
                <div>
                  <div className="text-sm text-[var(--color-dark)]">{r.client}</div>
                  <div className="text-xs text-[var(--color-gray-400)]">
                    {r.court} · {r.time}
                  </div>
                </div>
                <Badge status={r.status}>{r.label}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex gap-5">
        <Card className="w-[60%]">
          <div className="mb-4 text-[15px] text-[var(--color-dark)]">Reservas aguardando aprovação</div>
          <div className="flex flex-col">
            {approvals.length === 0 && (
              <span className="py-2.5 text-sm text-[var(--color-gray-400)]">Nenhuma reserva pendente.</span>
            )}
            {approvals.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center justify-between py-2.5 ${i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}
              >
                <div>
                  <div className="text-sm text-[var(--color-dark)]">{p.client}</div>
                  <div className="text-xs text-[var(--color-gray-400)]">
                    {p.court} · {p.time}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="px-3.5 py-1.5 text-xs"
                    onClick={() => setApprovals((prev) => prev.filter((item) => item.id !== p.id))}
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="ghost-destructive"
                    className="px-3.5 py-1.5 text-xs"
                    onClick={() => setApprovals((prev) => prev.filter((item) => item.id !== p.id))}
                  >
                    Recusar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="w-[40%]">
          <div className="mb-4 text-[15px] text-[var(--color-dark)]">Avisos</div>
          <div className="flex flex-col">
            {alerts.map((a, i) => (
              <div
                key={a}
                className={`flex items-start gap-2.5 py-2.5 ${i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}
              >
                <AlertCircle size={16} strokeWidth={1.5} color="var(--color-warning)" className="mt-0.5 shrink-0" />
                <span className="text-[13px] leading-relaxed text-[var(--color-dark)]">{a}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
