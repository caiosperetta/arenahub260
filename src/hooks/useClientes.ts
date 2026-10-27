import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { ClientWithStats, Profile } from '../types';

interface UseClientesResult {
  clients: ClientWithStats[];
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  refetch: () => void;
}

export function useClientes(): UseClientesResult {
  const { profile, loading: authLoading } = useAuth();
  const tenantId = profile?.tenant_id ?? null;

  const [allClients, setAllClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
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
        const [profilesRes, bookingsRes, monthlyPlansRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('tenant_id', tenantId).eq('role', 'client'),
          supabase.from('bookings').select('client_id, date').eq('tenant_id', tenantId),
          supabase.from('monthly_plans').select('client_id').eq('tenant_id', tenantId).eq('active', true),
        ]);

        if (profilesRes.error) throw profilesRes.error;
        if (bookingsRes.error) throw bookingsRes.error;
        if (monthlyPlansRes.error) throw monthlyPlansRes.error;
        if (cancelled) return;

        const bookingCountByClientId = new Map<string, number>();
        const lastBookingDateByClientId = new Map<string, string>();
        for (const row of bookingsRes.data ?? []) {
          bookingCountByClientId.set(row.client_id, (bookingCountByClientId.get(row.client_id) ?? 0) + 1);
          const current = lastBookingDateByClientId.get(row.client_id);
          if (!current || row.date > current) {
            lastBookingDateByClientId.set(row.client_id, row.date);
          }
        }

        const monthlyClientIds = new Set((monthlyPlansRes.data ?? []).map((row) => row.client_id));

        const enriched: ClientWithStats[] = ((profilesRes.data ?? []) as Profile[])
          .map((p) => ({
            ...p,
            total_bookings: bookingCountByClientId.get(p.id) ?? 0,
            last_booking_date: lastBookingDateByClientId.get(p.id) ?? null,
            is_monthly: monthlyClientIds.has(p.id),
          }))
          .sort((a, b) => a.full_name.localeCompare(b.full_name, 'pt-BR'));

        setAllClients(enriched);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
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

  const clients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allClients;
    return allClients.filter(
      (c) => c.full_name.toLowerCase().includes(term) || (c.phone ?? '').toLowerCase().includes(term),
    );
  }, [allClients, search]);

  return { clients, loading, isFetching, error, search, setSearch, refetch };
}
