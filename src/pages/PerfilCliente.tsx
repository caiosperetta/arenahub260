import { useEffect, useMemo, useState, type ComponentProps, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTenantBySlug } from '../hooks/useTenantBySlug';
import { SkeletonCard } from '../components/Skeletons';
import type { BookingStatus, Profile } from '../types';

interface StatsBookingRow {
  price: number;
  date: string;
  status: BookingStatus;
  courts: { name: string } | null;
}

interface Stats {
  totalBookings: number;
  favoriteCourtName: string;
  totalInvested: number;
  lastBookingDate: string | null;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatPrice(value: number): string {
  return currencyFormatter.format(value);
}

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

function memberSince(iso: string): string {
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(iso));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function Field({ label, ...props }: { label: string } & ComponentProps<typeof Input>) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] text-[var(--color-dark)]">{label}</label>
      <Input {...props} />
    </div>
  );
}

export default function PerfilCliente() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, refetchProfile } = useAuth();
  const { tenant, loading: tenantLoading, error: tenantError } = useTenantBySlug(slug);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingsForStats, setBookingsForStats] = useState<StatsBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate(`/${slug}/login`, { replace: true });
  }, [authLoading, user, slug, navigate]);

  useEffect(() => {
    if (!user || !tenant) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [profileRes, bookingsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user!.id).single(),
          supabase
            .from('bookings')
            .select('price, date, status, courts(name)')
            .eq('tenant_id', tenant!.id)
            .eq('client_id', user!.id),
        ]);

        if (profileRes.error) throw profileRes.error;
        if (bookingsRes.error) throw bookingsRes.error;
        if (cancelled) return;

        const p = profileRes.data as Profile;
        setProfile(p);
        setFullName(p.full_name);
        setPhone(p.phone ?? '');
        setBookingsForStats((bookingsRes.data ?? []) as unknown as StatsBookingRow[]);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user, tenant]);

  const stats: Stats = useMemo(() => {
    const courtCounts = new Map<string, number>();
    let totalInvested = 0;
    let lastBookingDate: string | null = null;

    for (const b of bookingsForStats) {
      const courtName = b.courts?.name ?? 'Quadra';
      courtCounts.set(courtName, (courtCounts.get(courtName) ?? 0) + 1);
      if (b.status === 'confirmed') totalInvested += b.price;
      if (!lastBookingDate || b.date > lastBookingDate) lastBookingDate = b.date;
    }

    let favoriteCourtName = '—';
    let maxCount = 0;
    for (const [name, count] of courtCounts) {
      if (count > maxCount) {
        maxCount = count;
        favoriteCourtName = name;
      }
    }

    return { totalBookings: bookingsForStats.length, favoriteCourtName, totalInvested, lastBookingDate };
  }, [bookingsForStats]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim(), phone: phone.trim() || null })
        .eq('id', user.id);
      if (updateError) throw updateError;
      await refetchProfile();
      setProfile((prev) => (prev ? { ...prev, full_name: fullName.trim(), phone: phone.trim() || null } : prev));
      setSaveMessage('Alterações salvas com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user || tenantLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-gray-200)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (tenantError || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <AlertCircle size={28} strokeWidth={1.5} color="var(--color-error)" />
        <span className="text-[15px] text-[var(--color-dark)]">{tenantError ?? 'Arena não encontrada'}</span>
      </div>
    );
  }

  const summary = [
    { label: 'Total de reservas', value: String(stats.totalBookings) },
    { label: 'Quadra favorita', value: stats.favoriteCourtName },
    { label: 'Total investido', value: formatPrice(stats.totalInvested) },
    { label: 'Última reserva', value: stats.lastBookingDate ? formatDateBR(stats.lastBookingDate) : '—' },
  ];

  return (
    <div className="-mx-12 flex gap-6 bg-[var(--color-gray-100)] px-12 pb-16 pt-10">
      <div className="flex w-[64%] flex-col gap-5">
        <Card>
          {loading || !profile ? (
            <div className="flex flex-col gap-4">
              <div className="h-16 w-16 animate-pulse rounded-full bg-[var(--color-gray-100)]" />
              <SkeletonCard className="h-24" />
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[22px] font-medium text-[var(--color-success-text)]">
                  {initials(profile.full_name)}
                </div>
                <div>
                  <div className="text-lg text-[var(--color-dark)]">{profile.full_name}</div>
                  <div className="text-[13px] text-[var(--color-gray-600)]">Cliente desde {memberSince(profile.created_at)}</div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <Field label="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  <Field label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
                </div>
                <div className="mb-6">
                  <Field label="Email" value={user.email ?? ''} disabled />
                </div>

                {error && <div className="mb-4 text-[12px] text-[var(--color-error)]">{error}</div>}
                {saveMessage && <div className="mb-4 text-[12px] text-[var(--color-success-text)]">{saveMessage}</div>}

                <div className="flex justify-end gap-3 border-t border-[var(--color-gray-100)] pt-5">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setFullName(profile.full_name);
                      setPhone(profile.phone ?? '');
                      setSaveMessage(null);
                      setError(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </Card>
      </div>

      <div className="w-[36%]">
        <Card>
          <div className="mb-4 text-[15px] text-[var(--color-dark)]">Resumo de reservas</div>
          <div className="flex flex-col gap-4">
            {summary.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-[13px] text-[var(--color-gray-600)]">{item.label}</span>
                <span className="text-sm text-[var(--color-dark)]">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
