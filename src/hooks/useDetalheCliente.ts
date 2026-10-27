import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { BookingStatus, BookingWithCourt, MonthlyPlanWithCourt, Profile } from '../types';

interface BookingJoinRow {
  id: string;
  tenant_id: string;
  court_id: string;
  client_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string | null;
  price: number;
  created_at: string;
  courts: { name: string; sport_type: string } | null;
}

function mapBookingRow(row: BookingJoinRow): BookingWithCourt {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    court_id: row.court_id,
    client_id: row.client_id,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    notes: row.notes,
    price: row.price,
    created_at: row.created_at,
    court_name: row.courts?.name ?? 'Quadra',
    court_sport_type: row.courts?.sport_type,
  };
}

interface MonthlyPlanJoinRow {
  id: string;
  tenant_id: string;
  client_id: string;
  court_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  price_per_month: number;
  active: boolean;
  created_at: string;
  courts: { name: string; sport_type: string } | null;
}

function mapMonthlyPlanRow(row: MonthlyPlanJoinRow): MonthlyPlanWithCourt {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    client_id: row.client_id,
    court_id: row.court_id,
    weekday: row.weekday,
    start_time: row.start_time,
    end_time: row.end_time,
    price_per_month: row.price_per_month,
    active: row.active,
    created_at: row.created_at,
    court_name: row.courts?.name ?? 'Quadra',
    court_sport_type: row.courts?.sport_type,
  };
}

const BOOKING_WITH_COURT_SELECT =
  'id, tenant_id, court_id, client_id, date, start_time, end_time, status, notes, price, created_at, courts(name, sport_type)';

const MONTHLY_PLAN_WITH_COURT_SELECT =
  'id, tenant_id, client_id, court_id, weekday, start_time, end_time, price_per_month, active, created_at, courts(name, sport_type)';

interface UseDetalheClienteResult {
  client: Profile | null;
  bookings: BookingWithCourt[];
  monthlyPlans: MonthlyPlanWithCourt[];
  loading: boolean;
  error: string | null;
}

export function useDetalheCliente(clientId: string | undefined): UseDetalheClienteResult {
  const { profile, loading: authLoading } = useAuth();
  const tenantId = profile?.tenant_id ?? null;

  const [client, setClient] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<BookingWithCourt[]>([]);
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlanWithCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!clientId || !tenantId) {
      setLoading(false);
      if (!tenantId) setError('Nenhuma arena associada a este usuário.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [clientRes, bookingsRes, monthlyPlansRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', clientId).eq('tenant_id', tenantId).single(),
          supabase
            .from('bookings')
            .select(BOOKING_WITH_COURT_SELECT)
            .eq('client_id', clientId)
            .eq('tenant_id', tenantId)
            .order('date', { ascending: false }),
          supabase
            .from('monthly_plans')
            .select(MONTHLY_PLAN_WITH_COURT_SELECT)
            .eq('client_id', clientId)
            .eq('tenant_id', tenantId),
        ]);

        if (clientRes.error) throw clientRes.error;
        if (bookingsRes.error) throw bookingsRes.error;
        if (monthlyPlansRes.error) throw monthlyPlansRes.error;
        if (cancelled) return;

        setClient(clientRes.data ?? null);
        setBookings(((bookingsRes.data ?? []) as unknown as BookingJoinRow[]).map(mapBookingRow));
        setMonthlyPlans(((monthlyPlansRes.data ?? []) as unknown as MonthlyPlanJoinRow[]).map(mapMonthlyPlanRow));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar cliente');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [clientId, tenantId, authLoading]);

  return { client, bookings, monthlyPlans, loading, error };
}
