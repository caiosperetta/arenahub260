import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { BookingStatus, BookingWithRelations } from '../types';

export interface ReservasFilters {
  search: string;
  court_id: string;
  status: string;
  date: string;
}

export interface CourtOption {
  id: string;
  name: string;
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
  courts: { name: string; sport_type: string } | null;
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
    court_sport_type: row.courts?.sport_type,
  };
}

const BOOKING_WITH_RELATIONS_SELECT =
  'id, tenant_id, court_id, client_id, date, start_time, end_time, status, notes, price, created_at, profiles(full_name, phone), courts(name, sport_type)';

const DEFAULT_FILTERS: ReservasFilters = { search: '', court_id: '', status: '', date: '' };

interface UseReservasResult {
  bookings: BookingWithRelations[];
  courts: CourtOption[];
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  filters: ReservasFilters;
  setFilters: Dispatch<SetStateAction<ReservasFilters>>;
  refetch: () => void;
}

export function useReservas(): UseReservasResult {
  const { profile, loading: authLoading } = useAuth();
  const tenantId = profile?.tenant_id ?? null;

  const [allBookings, setAllBookings] = useState<BookingWithRelations[]>([]);
  const [courts, setCourts] = useState<CourtOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReservasFilters>(DEFAULT_FILTERS);
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

    async function load() {
      try {
        const [bookingsRes, courtsRes] = await Promise.all([
          supabase
            .from('bookings')
            .select(BOOKING_WITH_RELATIONS_SELECT)
            .eq('tenant_id', tenantId)
            .order('date', { ascending: false })
            .order('start_time', { ascending: false }),
          supabase.from('courts').select('id, name').eq('tenant_id', tenantId).eq('active', true),
        ]);

        if (bookingsRes.error) throw bookingsRes.error;
        if (courtsRes.error) throw courtsRes.error;
        if (cancelled) return;

        setAllBookings(((bookingsRes.data ?? []) as unknown as BookingJoinRow[]).map(mapBookingRow));
        setCourts(courtsRes.data ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar reservas');
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

  const bookings = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return allBookings.filter((b) => {
      if (
        search &&
        !b.client_full_name.toLowerCase().includes(search) &&
        !b.court_name.toLowerCase().includes(search)
      ) {
        return false;
      }
      if (filters.court_id && b.court_id !== filters.court_id) return false;
      if (filters.status && b.status !== filters.status) return false;
      if (filters.date && b.date !== filters.date) return false;
      return true;
    });
  }, [allBookings, filters]);

  return { bookings, courts, loading, isFetching, error, filters, setFilters, refetch };
}
