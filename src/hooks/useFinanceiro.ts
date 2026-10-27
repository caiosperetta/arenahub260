import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { BookingStatus, BookingWithRelations, FinanceiroMetrics, FinanceiroPeriod } from '../types';

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getDateDaysAgoString(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const PERIOD_DAYS: Record<FinanceiroPeriod, number> = {
  hoje: 0,
  '7dias': 7,
  '30dias': 30,
  '3meses': 90,
};

function getPeriodStartDateString(period: FinanceiroPeriod): string {
  return getDateDaysAgoString(PERIOD_DAYS[period]);
}

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
  profiles: { full_name: string; phone: string | null } | null;
  courts: { name: string } | null;
}

function mapBookingRow(row: BookingJoinRow): BookingWithRelations {
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
    client_full_name: row.profiles?.full_name ?? 'Cliente',
    client_phone: row.profiles?.phone ?? null,
    court_name: row.courts?.name ?? 'Quadra',
  };
}

const BOOKING_WITH_RELATIONS_SELECT =
  'id, tenant_id, court_id, client_id, date, start_time, end_time, status, notes, price, created_at, profiles(full_name, phone), courts(name)';

interface UseFinanceiroResult {
  metrics: FinanceiroMetrics;
  transactions: BookingWithRelations[];
  overdueClients: BookingWithRelations[];
  period: FinanceiroPeriod;
  setPeriod: (period: FinanceiroPeriod) => void;
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => void;
}

const EMPTY_METRICS: FinanceiroMetrics = {
  confirmedRevenue: 0,
  pendingRevenue: 0,
  totalBookings: 0,
  averageTicket: 0,
};

export function useFinanceiro(): UseFinanceiroResult {
  const { profile, loading: authLoading } = useAuth();
  const tenantId = profile?.tenant_id ?? null;

  const [metrics, setMetrics] = useState<FinanceiroMetrics>(EMPTY_METRICS);
  const [transactions, setTransactions] = useState<BookingWithRelations[]>([]);
  const [overdueClients, setOverdueClients] = useState<BookingWithRelations[]>([]);
  const [period, setPeriod] = useState<FinanceiroPeriod>('30dias');
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);
  const isFirstLoadRef = useRef(true);

  const refetch = useCallback(() => setRefetchIndex((i) => i + 1), []);

  useEffect(() => {
    if (authLoading) return;

    if (!tenantId) {
      setLoading(false);
      setError('Nenhuma arena associada a este usuário.');
      return;
    }

    let cancelled = false;
    if (isFirstLoadRef.current) {
      setLoading(true);
    } else {
      setIsFetching(true);
    }
    setError(null);

    const today = getTodayDateString();
    const periodStart = getPeriodStartDateString(period);
    const threeDaysAgo = getDateDaysAgoString(3);

    async function load() {
      try {
        const [confirmedRes, pendingRes, totalCountRes, transactionsRes, overdueRes] = await Promise.all([
          supabase
            .from('bookings')
            .select('price')
            .eq('tenant_id', tenantId)
            .eq('status', 'confirmed')
            .gte('date', periodStart)
            .lte('date', today),
          supabase
            .from('bookings')
            .select('price')
            .eq('tenant_id', tenantId)
            .eq('status', 'pending')
            .gte('date', periodStart)
            .lte('date', today),
          supabase
            .from('bookings')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .gte('date', periodStart)
            .lte('date', today),
          supabase
            .from('bookings')
            .select(BOOKING_WITH_RELATIONS_SELECT)
            .eq('tenant_id', tenantId)
            .gte('date', periodStart)
            .order('date', { ascending: false })
            .order('start_time', { ascending: false })
            .limit(50),
          supabase
            .from('bookings')
            .select(BOOKING_WITH_RELATIONS_SELECT)
            .eq('tenant_id', tenantId)
            .eq('status', 'pending')
            .lt('date', threeDaysAgo)
            .order('date', { ascending: true }),
        ]);

        const firstError =
          confirmedRes.error || pendingRes.error || totalCountRes.error || transactionsRes.error || overdueRes.error;
        if (firstError) throw firstError;
        if (cancelled) return;

        const confirmedRows = confirmedRes.data ?? [];
        const confirmedRevenue = confirmedRows.reduce((sum, row) => sum + Number(row.price ?? 0), 0);
        const pendingRevenue = (pendingRes.data ?? []).reduce((sum, row) => sum + Number(row.price ?? 0), 0);
        const averageTicket = confirmedRows.length > 0 ? confirmedRevenue / confirmedRows.length : 0;

        setMetrics({
          confirmedRevenue,
          pendingRevenue,
          totalBookings: totalCountRes.count ?? 0,
          averageTicket,
        });

        setTransactions(((transactionsRes.data ?? []) as unknown as BookingJoinRow[]).map(mapBookingRow));
        setOverdueClients(((overdueRes.data ?? []) as unknown as BookingJoinRow[]).map(mapBookingRow));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar dados financeiros');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsFetching(false);
          isFirstLoadRef.current = false;
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [tenantId, authLoading, period, refetchIndex]);

  return { metrics, transactions, overdueClients, period, setPeriod, loading, isFetching, error, refetch };
}
