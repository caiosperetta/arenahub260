import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { buildDefaultOpeningHours } from './useOpeningHours';
import type { BookingStatus, Court, CourtSlot, OpeningHours, Tenant } from '../types';

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export interface BookingAvailability {
  court_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
}

interface UsePortalClienteResult {
  courts: Court[];
  slots: CourtSlot[];
  openingHours: OpeningHours[];
  bookings: BookingAvailability[];
  selectedCourtId: string | null;
  setSelectedCourtId: (courtId: string) => void;
  selectedWeek: Date;
  setSelectedWeek: (date: Date) => void;
  createBooking: (courtId: string, date: string, startTime: string, endTime: string, notes: string) => Promise<void>;
  loading: boolean;
  isFetching: boolean;
  openingHoursLoaded: boolean;
  error: string | null;
  bookingLoading: boolean;
}

export function usePortalCliente(tenant: Tenant | null): UsePortalClienteResult {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courts, setCourts] = useState<Court[]>([]);
  const [slots, setSlots] = useState<CourtSlot[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);
  const [bookings, setBookings] = useState<BookingAvailability[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Date>(() => new Date());
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [openingHoursLoaded, setOpeningHoursLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [refetchIndex, setRefetchIndex] = useState(0);
  const isFirstLoadRef = useRef(true);

  const weekStartISO = useMemo(() => toISODate(startOfWeek(selectedWeek)), [selectedWeek]);
  const weekEndISO = useMemo(() => toISODate(addDays(startOfWeek(selectedWeek), 6)), [selectedWeek]);

  const refetch = useCallback(() => setRefetchIndex((i) => i + 1), []);

  useEffect(() => {
    if (!tenant) {
      setLoading(false);
      return;
    }

    const tenantId = tenant.id;
    let cancelled = false;
    if (isFirstLoadRef.current) {
      setLoading(true);
    } else {
      setIsFetching(true);
    }
    setError(null);

    async function load() {
      try {
        const [courtsRes, slotsRes, openingHoursRes, bookingsRes] = await Promise.all([
          supabase.from('courts').select('*').eq('tenant_id', tenantId).eq('active', true).order('name'),
          supabase.from('court_slots').select('*').eq('tenant_id', tenantId).eq('active', true),
          supabase.from('opening_hours').select('*').eq('tenant_id', tenantId).order('weekday', { ascending: true }),
          supabase
            .from('bookings')
            .select('court_id, date, start_time, end_time, status')
            .eq('tenant_id', tenantId)
            .gte('date', weekStartISO)
            .lte('date', weekEndISO)
            .in('status', ['confirmed', 'pending']),
        ]);

        if (courtsRes.error) throw courtsRes.error;
        if (slotsRes.error) throw slotsRes.error;
        if (openingHoursRes.error) throw openingHoursRes.error;
        if (bookingsRes.error) throw bookingsRes.error;
        if (cancelled) return;

        const openingHoursRows = (openingHoursRes.data ?? []) as OpeningHours[];
        const resolvedOpeningHours = openingHoursRows.length > 0 ? openingHoursRows : buildDefaultOpeningHours(tenantId);
        console.log('[usePortalCliente] opening_hours fetched:', openingHoursRows.length, '— using', openingHoursRows.length > 0 ? 'tenant data' : 'defaults', resolvedOpeningHours);
        setCourts(courtsRes.data ?? []);
        setSlots(slotsRes.data ?? []);
        setOpeningHours(resolvedOpeningHours);
        setBookings((bookingsRes.data ?? []) as BookingAvailability[]);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar dados da arena');
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsFetching(false);
          setOpeningHoursLoaded(true);
          isFirstLoadRef.current = false;
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [tenant, weekStartISO, weekEndISO, refetchIndex]);

  useEffect(() => {
    if (!selectedCourtId && courts.length > 0) {
      setSelectedCourtId(courts[0].id);
    }
  }, [courts, selectedCourtId]);

  const createBooking = useCallback(
    async (courtId: string, date: string, startTime: string, endTime: string, notes: string) => {
      if (!tenant) return;

      if (!user) {
        navigate(`/${tenant.slug}/login`);
        return;
      }

      const court = courts.find((c) => c.id === courtId);
      if (!court) return;

      setBookingLoading(true);
      setError(null);
      try {
        const { error: insertError } = await supabase.from('bookings').insert({
          tenant_id: tenant.id,
          court_id: courtId,
          client_id: user.id,
          date,
          start_time: startTime,
          end_time: endTime,
          status: 'pending',
          notes: notes || null,
          price: court.price_per_hour,
        });

        if (insertError) throw insertError;
        refetch();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao criar reserva');
        throw err;
      } finally {
        setBookingLoading(false);
      }
    },
    [tenant, user, courts, navigate, refetch],
  );

  return {
    courts,
    slots,
    openingHours,
    bookings,
    selectedCourtId,
    setSelectedCourtId,
    selectedWeek,
    setSelectedWeek,
    createBooking,
    loading,
    isFetching,
    openingHoursLoaded,
    error,
    bookingLoading,
  };
}
