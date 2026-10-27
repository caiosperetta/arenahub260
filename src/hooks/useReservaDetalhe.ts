import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { BookingStatus, BookingWithRelations } from '../types';

interface BookingDetailJoinRow {
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
  profiles: { full_name: string; phone: string | null; avatar_url: string | null } | null;
  courts: { name: string; sport_type: string; price_per_hour: number } | null;
}

function mapBookingRow(row: BookingDetailJoinRow): BookingWithRelations {
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
    client_avatar_url: row.profiles?.avatar_url ?? null,
    court_name: row.courts?.name ?? 'Quadra',
    court_sport_type: row.courts?.sport_type,
    court_price_per_hour: row.courts?.price_per_hour,
  };
}

const BOOKING_DETAIL_SELECT =
  'id, tenant_id, court_id, client_id, date, start_time, end_time, status, notes, price, created_at, profiles(full_name, phone, avatar_url), courts(name, sport_type, price_per_hour)';

interface UseReservaDetalheResult {
  booking: BookingWithRelations | null;
  loading: boolean;
  error: string | null;
  updateStatus: (status: 'confirmed' | 'rejected') => Promise<BookingWithRelations | null>;
}

export function useReservaDetalhe(id: string | undefined): UseReservaDetalheResult {
  const { profile, loading: authLoading } = useAuth();
  const tenantId = profile?.tenant_id ?? null;

  const [booking, setBooking] = useState<BookingWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!id || !tenantId) {
      setLoading(false);
      if (!tenantId) setError('Nenhuma arena associada a este usuário.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select(BOOKING_DETAIL_SELECT)
          .eq('id', id)
          .eq('tenant_id', tenantId)
          .single();

        if (fetchError) throw fetchError;
        if (cancelled) return;

        setBooking(data ? mapBookingRow(data as unknown as BookingDetailJoinRow) : null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar reserva');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, tenantId, authLoading]);

  const updateStatus = useCallback(
    async (status: 'confirmed' | 'rejected') => {
      if (!id || !tenantId) return null;

      const { data, error: updateError } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select(BOOKING_DETAIL_SELECT)
        .single();

      if (updateError) {
        setError(updateError.message);
        throw updateError;
      }

      const updated = data ? mapBookingRow(data as unknown as BookingDetailJoinRow) : null;
      setBooking(updated);
      return updated;
    },
    [id, tenantId],
  );

  return { booking, loading, error, updateStatus };
}
