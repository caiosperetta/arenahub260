import { Search, Eye, Users, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Input from '../components/Input';
import { useAdminHeader } from '../layouts/AdminHeaderContext';
import { useClientes } from '../hooks/useClientes';
import type { ClientWithStats } from '../types';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

const AVATAR_BG = ['#DCFCE7', '#DBEAFE', '#FEF9C3', '#FCE7F3'];
const AVATAR_TEXT = ['#15803D', '#2563EB', '#CA8A04', '#9D174D'];

const gridCols = 'grid-cols-[2fr_1fr_1.1fr_1fr_0.8fr]';

function ClientSkeletonRow({ index }: { index: number }) {
  return (
    <div className={`grid ${gridCols} items-center px-5 py-3.5 ${index > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-gray-100)]" />
      ))}
    </div>
  );
}

function ClientRow({ client, index }: { client: ClientWithStats; index: number }) {
  const bg = AVATAR_BG[index % AVATAR_BG.length];
  const text = AVATAR_TEXT[index % AVATAR_TEXT.length];
  return (
    <div className={`grid ${gridCols} items-center px-5 py-3.5`}>
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
          style={{ backgroundColor: bg, color: text }}
        >
          {getInitials(client.full_name)}
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--color-dark)]">{client.full_name}</span>
          <span className="text-xs text-[var(--color-gray-400)]">{client.phone ?? 'Sem telefone'}</span>
        </div>
      </div>
      <span className="text-sm text-[var(--color-gray-600)]">{client.total_bookings}</span>
      <span className="text-sm text-[var(--color-gray-600)]">{formatDate(client.last_booking_date)}</span>
      <Badge status={client.is_monthly ? 'confirmed' : 'inactive'} className="w-fit">
        {client.is_monthly ? 'Mensalista' : 'Avulso'}
      </Badge>
      <div className="flex gap-3">
        <Link to={`/app/clientes/${client.id}`} aria-label="Ver cliente">
          <Eye size={16} strokeWidth={1.5} color="var(--color-gray-600)" className="cursor-pointer" />
        </Link>
      </div>
    </div>
  );
}

export default function Clientes() {
  const { clients, loading, error, search, setSearch } = useClientes();

  useAdminHeader({
    title: 'Clientes',
    subtitle: loading ? 'Carregando clientes...' : `${clients.length} cliente${clients.length === 1 ? '' : 's'} encontrado${clients.length === 1 ? '' : 's'}`,
  });

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            strokeWidth={1.5}
            color="var(--color-gray-400)"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
          />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {error ? (
        <Card className="flex items-center gap-2.5 text-[var(--color-error-text)]">
          <AlertCircle size={18} strokeWidth={1.5} />
          <span className="text-sm">{error}</span>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className={`grid ${gridCols} border-b border-[var(--color-gray-200)] bg-[var(--color-gray-50)] px-5 py-3`}>
            <span className="text-xs font-medium text-[var(--color-gray-600)]">CLIENTE</span>
            <span className="text-xs font-medium text-[var(--color-gray-600)]">RESERVAS</span>
            <span className="text-xs font-medium text-[var(--color-gray-600)]">ÚLTIMO AGENDAMENTO</span>
            <span className="text-xs font-medium text-[var(--color-gray-600)]">PLANO</span>
            <span className="text-xs font-medium text-[var(--color-gray-600)]">AÇÕES</span>
          </div>

          {loading && Array.from({ length: 6 }).map((_, i) => <ClientSkeletonRow key={i} index={i} />)}

          {!loading && clients.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--color-gray-400)]">
              <Users size={24} strokeWidth={1.5} />
              <span className="text-sm">Nenhum cliente encontrado</span>
            </div>
          )}

          {!loading &&
            clients.map((c, i) => (
              <div key={c.id} className={i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}>
                <ClientRow client={c} index={i} />
              </div>
            ))}
        </Card>
      )}
    </div>
  );
}
