import { Search, Download, Plus, Eye, Pencil, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { useAdminHeader } from '../layouts/AdminHeaderContext';

interface Reservation {
  client: string;
  court: string;
  date: string;
  time: string;
  value: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  label: string;
}

const reservations: Reservation[] = [
  { client: 'Maria Silva', court: 'Quadra 2', date: '07/08/2026', time: '19:00', value: 'R$70', status: 'confirmed', label: 'Confirmado' },
  { client: 'Pedro Santos', court: 'Quadra 1', date: '07/08/2026', time: '20:00', value: 'R$80', status: 'pending', label: 'Pendente' },
  { client: 'Ana Costa', court: 'Quadra 3', date: '07/08/2026', time: '21:00', value: 'R$90', status: 'confirmed', label: 'Confirmado' },
  { client: 'Lucas Almeida', court: 'Quadra 4', date: '07/08/2026', time: '22:00', value: 'R$60', status: 'confirmed', label: 'Confirmado' },
  { client: 'Fernanda Lima', court: 'Quadra 1', date: '08/08/2026', time: '18:00', value: 'R$80', status: 'pending', label: 'Pendente' },
  { client: 'Rafael Souza', court: 'Quadra 3', date: '08/08/2026', time: '20:00', value: 'R$90', status: 'pending', label: 'Pendente' },
  { client: 'Beatriz Nunes', court: 'Quadra 2', date: '09/08/2026', time: '09:00', value: 'R$70', status: 'cancelled', label: 'Cancelado' },
  { client: 'Carlos Rezende', court: 'Quadra 4', date: '09/08/2026', time: '17:00', value: 'R$60', status: 'confirmed', label: 'Confirmado' },
  { client: 'Juliana Martins', court: 'Quadra 2', date: '10/08/2026', time: '11:00', value: 'R$70', status: 'cancelled', label: 'Cancelado' },
];

const gridCols = 'grid-cols-[1.6fr_1.2fr_1fr_1fr_1fr_1fr_0.8fr]';

export default function Reservas() {
  useAdminHeader({
    title: 'Reservas',
    subtitle: '42 reservas neste mês',
    action: (
      <Button variant="primary">
        <Plus size={16} strokeWidth={1.5} />
        Nova reserva
      </Button>
    ),
  });

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] px-3 py-2">
          <Search size={16} strokeWidth={1.5} color="var(--color-gray-400)" />
          <input
            placeholder="Buscar por cliente..."
            className="flex-1 border-none bg-transparent text-sm text-[var(--color-dark)] placeholder:text-[var(--color-gray-400)] outline-none"
          />
        </div>
        <select className="rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] bg-white px-3 py-2 text-[13px] text-[var(--color-dark)]">
          <option>Todas as datas</option>
        </select>
        <select className="rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] bg-white px-3 py-2 text-[13px] text-[var(--color-dark)]">
          <option>Todas as quadras</option>
        </select>
        <select className="rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] bg-white px-3 py-2 text-[13px] text-[var(--color-dark)]">
          <option>Todos os status</option>
        </select>
        <Button variant="secondary" className="px-3.5 py-2 text-[13px]">
          <Download size={14} strokeWidth={1.5} />
          Exportar
        </Button>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className={`grid ${gridCols} border-b border-[var(--color-gray-200)] bg-[var(--color-gray-50)] px-5 py-3`}>
          <span className="text-xs font-medium text-[var(--color-gray-600)]">CLIENTE</span>
          <span className="text-xs font-medium text-[var(--color-gray-600)]">QUADRA</span>
          <span className="text-xs font-medium text-[var(--color-gray-600)]">DATA</span>
          <span className="text-xs font-medium text-[var(--color-gray-600)]">HORÁRIO</span>
          <span className="text-xs font-medium text-[var(--color-gray-600)]">VALOR</span>
          <span className="text-xs font-medium text-[var(--color-gray-600)]">STATUS</span>
          <span className="text-xs font-medium text-[var(--color-gray-600)]">AÇÕES</span>
        </div>
        {reservations.map((r, i) => (
          <div
            key={`${r.client}-${r.date}-${r.time}`}
            className={`grid ${gridCols} items-center px-5 py-3.5 ${i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}
          >
            <span className="text-sm text-[var(--color-dark)]">{r.client}</span>
            <span className="text-sm text-[var(--color-gray-600)]">{r.court}</span>
            <span className="text-sm text-[var(--color-gray-600)]">{r.date}</span>
            <span className="text-sm text-[var(--color-gray-600)]">{r.time}</span>
            <span className="text-sm text-[var(--color-gray-600)]">{r.value}</span>
            <Badge status={r.status} className="w-fit">
              {r.label}
            </Badge>
            <div className="flex gap-3">
              <Link to={`/reservas/${i + 1}`} aria-label="Ver reserva">
                <Eye size={16} strokeWidth={1.5} color="var(--color-gray-600)" className="cursor-pointer" />
              </Link>
              <Pencil size={16} strokeWidth={1.5} color="var(--color-gray-600)" className="cursor-pointer" />
              <X size={16} strokeWidth={1.5} color="var(--color-gray-400)" className="cursor-pointer" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
