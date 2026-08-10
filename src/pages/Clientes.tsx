import { Search, Plus, Eye, MessageCircle, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { useAdminHeader } from '../layouts/AdminHeaderContext';

interface ClientRow {
  name: string;
  initials: string;
  avatarBg: string;
  phone: string;
  total: number;
  plan: 'confirmed' | 'inactive';
  planLabel: string;
  lastBooking: string;
}

const clients: ClientRow[] = [
  { name: 'Maria Silva', initials: 'MS', avatarBg: 'var(--color-primary-light)', phone: '(16) 99123-1111', total: 24, plan: 'confirmed', planLabel: 'Mensalista', lastBooking: '07/08/2026' },
  { name: 'Pedro Santos', initials: 'PS', avatarBg: 'var(--color-info-bg)', phone: '(16) 99123-2222', total: 6, plan: 'inactive', planLabel: 'Avulso', lastBooking: '07/08/2026' },
  { name: 'Ana Costa', initials: 'AC', avatarBg: 'var(--color-warning-bg)', phone: '(16) 99123-3333', total: 18, plan: 'confirmed', planLabel: 'Mensalista', lastBooking: '07/08/2026' },
  { name: 'Lucas Almeida', initials: 'LA', avatarBg: 'var(--color-error-bg)', phone: '(16) 99123-4444', total: 3, plan: 'inactive', planLabel: 'Avulso', lastBooking: '05/08/2026' },
  { name: 'Fernanda Lima', initials: 'FL', avatarBg: 'var(--color-primary-light)', phone: '(16) 99123-5555', total: 31, plan: 'confirmed', planLabel: 'Mensalista', lastBooking: '08/08/2026' },
  { name: 'Rafael Souza', initials: 'RS', avatarBg: 'var(--color-info-bg)', phone: '(16) 99123-6666', total: 9, plan: 'inactive', planLabel: 'Avulso', lastBooking: '08/08/2026' },
  { name: 'Beatriz Nunes', initials: 'BN', avatarBg: 'var(--color-warning-bg)', phone: '(16) 99123-7777', total: 2, plan: 'inactive', planLabel: 'Avulso', lastBooking: '02/08/2026' },
  { name: 'Carlos Rezende', initials: 'CR', avatarBg: 'var(--color-primary-light)', phone: '(16) 99123-8888', total: 40, plan: 'confirmed', planLabel: 'Mensalista', lastBooking: '09/08/2026' },
];

const gridCols = 'grid-cols-[2fr_1.3fr_1fr_1fr_1.1fr_0.8fr]';

export default function Clientes() {
  useAdminHeader({
    title: 'Clientes',
    subtitle: '127 clientes ativos',
    action: (
      <Button variant="primary">
        <Plus size={16} strokeWidth={1.5} />
        Novo cliente
      </Button>
    ),
  });

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] px-3 py-2">
          <Search size={16} strokeWidth={1.5} color="var(--color-gray-400)" />
          <input
            placeholder="Buscar por nome ou telefone..."
            className="flex-1 border-none bg-transparent text-sm text-[var(--color-dark)] placeholder:text-[var(--color-gray-400)] outline-none"
          />
        </div>
        <select className="rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] bg-white px-3 py-2 text-[13px] text-[var(--color-dark)]">
          <option>Todos os planos</option>
        </select>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className={`grid ${gridCols} border-b border-[var(--color-gray-200)] bg-[var(--color-gray-50)] px-5 py-3`}>
          <span className="text-xs font-medium text-[var(--color-gray-600)]">CLIENTE</span>
          <span className="text-xs font-medium text-[var(--color-gray-600)]">TELEFONE</span>
          <span className="text-xs font-medium text-[var(--color-gray-600)]">RESERVAS</span>
          <span className="text-xs font-medium text-[var(--color-gray-600)]">PLANO</span>
          <span className="text-xs font-medium text-[var(--color-gray-600)]">ÚLTIMA RESERVA</span>
          <span className="text-xs font-medium text-[var(--color-gray-600)]">AÇÕES</span>
        </div>
        {clients.map((c, i) => (
          <div
            key={c.name}
            className={`grid ${gridCols} items-center px-5 py-3.5 ${i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-[var(--color-dark)]"
                style={{ backgroundColor: c.avatarBg }}
              >
                {c.initials}
              </div>
              <span className="text-sm text-[var(--color-dark)]">{c.name}</span>
            </div>
            <span className="text-sm text-[var(--color-gray-600)]">{c.phone}</span>
            <span className="text-sm text-[var(--color-gray-600)]">{c.total}</span>
            <Badge status={c.plan} className="w-fit">
              {c.planLabel}
            </Badge>
            <span className="text-sm text-[var(--color-gray-600)]">{c.lastBooking}</span>
            <div className="flex gap-3">
              <Link to={`/clientes/${i + 1}`} aria-label="Ver cliente">
                <Eye size={16} strokeWidth={1.5} color="var(--color-gray-600)" className="cursor-pointer" />
              </Link>
              <MessageCircle size={16} strokeWidth={1.5} color="var(--color-gray-600)" className="cursor-pointer" />
              <Pencil size={16} strokeWidth={1.5} color="var(--color-gray-600)" className="cursor-pointer" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
