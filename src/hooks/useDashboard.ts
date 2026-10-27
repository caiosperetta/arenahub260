import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { BookingStatus, BookingWithRelations, CourtOccupancy, DashboardMetrics } from '../types';

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getDateDaysAgoString(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

interface UseDashboardResult {
  metrics: DashboardMetrics | null;
  upcomingBookings: BookingWithRelations[];
  pendingBookings: BookingWithRelations[];
  courtOccupancy: CourtOccupancy[];
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboard(): UseDashboardResult {
  const { profile, loading: authLoading } = useAuth();
  const tenantId = profile?.tenant_id ?? null;

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<BookingWithRelations[]>([]);
  const [pendingBookings, setPendingBookings] = useState<BookingWithRelations[]>([]);
  const [courtOccupancy, setCourtOccupancy] = useState<CourtOccupancy[]>([]);
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
    const thirtyDaysAgo = getDateDaysAgoString(30);

    async function load() {
      try {
        const [
          revenueRes,
          totalTodayRes,
          pendingCountRes,
          totalSlotsRes,
          confirmedTodayCountRes,
          activeClientsRes,
          upcomingRes,
          pendingListRes,
          courtsRes,
          courtBookingsTodayRes,
        ] = await Promise.all([
          supabase.from('bookings').select('price').eq('tenant_id', tenantId).eq('date', today).eq('status', 'confirmed'),
          supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('date', today),
          supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'pending'),
          supabase.from('court_slots').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
          supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('date', today).eq('status', 'confirmed'),
          supabase.from('bookings').select('client_id').eq('tenant_id', tenantId).gte('created_at', thirtyDaysAgo),
          supabase
            .from('bookings')
            .select(BOOKING_WITH_RELATIONS_SELECT)
            .eq('tenant_id', tenantId)
            .gte('date', today)
            .in('status', ['confirmed', 'pending'])
            .order('date', { ascending: true })
            .order('start_time', { ascending: true })
            .limit(5),
          supabase
            .from('bookings')
            .select(BOOKING_WITH_RELATIONS_SELECT)
            .eq('tenant_id', tenantId)
            .gte('date', today)
            .eq('status', 'pending')
            .order('date', { ascending: true })
            .order('start_time', { ascending: true })
            .limit(5),
          supabase.from('courts').select('id, name').eq('tenant_id', tenantId),
          supabase.from('bookings').select('court_id').eq('tenant_id', tenantId).eq('date', today).eq('status', 'confirmed'),
        ]);

        const firstError =
          revenueRes.error ||
          totalTodayRes.error ||
          pendingCountRes.error ||
          totalSlotsRes.error ||
          confirmedTodayCountRes.error ||
          activeClientsRes.error ||
          upcomingRes.error ||
          pendingListRes.error ||
          courtsRes.error ||
          courtBookingsTodayRes.error;

        if (firstError) throw firstError;
        if (cancelled) return;

        const revenueToday = (revenueRes.data ?? []).reduce((sum, row) => sum + Number(row.price ?? 0), 0);
        const totalSlots = totalSlotsRes.count ?? 0;
        const confirmedToday = confirmedTodayCountRes.count ?? 0;
        const occupancyPct = totalSlots > 0 ? Math.round((confirmedToday / totalSlots) * 100) : 0;
        const activeClients = new Set((activeClientsRes.data ?? []).map((row) => row.client_id)).size;

        setMetrics({
          revenueToday,
          totalBookingsToday: totalTodayRes.count ?? 0,
          pendingBookings: pendingCountRes.count ?? 0,
          occupancyPct,
          activeClients,
        });

        setUpcomingBookings(((upcomingRes.data ?? []) as unknown as BookingJoinRow[]).map(mapBookingRow));
        setPendingBookings(((pendingListRes.data ?? []) as unknown as BookingJoinRow[]).map(mapBookingRow));

        const bookingsCountByCourtId = new Map<string, number>();
        for (const row of courtBookingsTodayRes.data ?? []) {
          bookingsCountByCourtId.set(row.court_id, (bookingsCountByCourtId.get(row.court_id) ?? 0) + 1);
        }
        setCourtOccupancy(
          (courtsRes.data ?? []).map((court) => ({
            court_id: court.id,
            court_name: court.name,
            bookings_count: bookingsCountByCourtId.get(court.id) ?? 0,
          })),
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard');
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
  }, [tenantId, authLoading, refetchIndex]);

  return { metrics, upcomingBookings, pendingBookings, courtOccupancy, loading, isFetching, error, refetch };
}
