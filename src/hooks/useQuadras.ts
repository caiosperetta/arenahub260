import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { buildDefaultOpeningHours } from './useOpeningHours';
import type { Court, CourtSlot, OpeningHours } from '../types';

export interface CreateCourtInput {
  name: string;
  sport_type: string;
  price_per_hour: number;
  active?: boolean;
}

export interface UpdateCourtInput {
  name: string;
  sport_type: string;
  price_per_hour: number;
}

export interface CreateSlotInput {
  court_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  active?: boolean;
}

interface UseQuadrasResult {
  courts: Court[];
  slots: Record<string, CourtSlot[]>;
  openingHours: OpeningHours[];
  loading: boolean;
  isFetching: boolean;
  openingHoursLoading: boolean;
  error: string | null;
  toggleActive: (courtId: string, currentActive: boolean) => Promise<void>;
  createCourt: (data: CreateCourtInput) => Promise<Court>;
  updateCourt: (courtId: string, data: UpdateCourtInput) => Promise<void>;
  deleteCourt: (courtId: string) => Promise<void>;
  createSlot: (data: CreateSlotInput) => Promise<void>;
  deleteSlot: (slotId: string) => Promise<void>;
  uploadCourtPhoto: (courtId: string, file: File) => Promise<string>;
  refetch: () => void;
}

export function useQuadras(): UseQuadrasResult {
  const { profile, loading: authLoading } = useAuth();
  const tenantId = profile?.tenant_id ?? null;

  const [courts, setCourts] = useState<Court[]>([]);
  const [allSlots, setAllSlots] = useState<CourtSlot[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [openingHoursLoading, setOpeningHoursLoading] = useState(true);
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

    const currentTenantId = tenantId;
    let cancelled = false;
    if (isFirstLoadRef.current) {
      setLoading(true);
    } else {
      setIsFetching(true);
    }
    setOpeningHoursLoading(true);
    setError(null);

    async function load() {
      try {
        const [courtsRes, slotsRes, openingHoursRes] = await Promise.all([
          supabase.from('courts').select('*').eq('tenant_id', currentTenantId).order('created_at', { ascending: true }),
          supabase
            .from('court_slots')
            .select('*')
            .eq('tenant_id', currentTenantId)
            .order('weekday', { ascending: true })
            .order('start_time', { ascending: true }),
          supabase.from('opening_hours').select('*').eq('tenant_id', currentTenantId).order('weekday', { ascending: true }),
        ]);

        if (courtsRes.error) throw courtsRes.error;
        if (slotsRes.error) throw slotsRes.error;
        if (openingHoursRes.error) throw openingHoursRes.error;
        if (cancelled) return;

        const openingHoursRows = (openingHoursRes.data ?? []) as OpeningHours[];
        setCourts(courtsRes.data ?? []);
        setAllSlots(slotsRes.data ?? []);
        setOpeningHours(openingHoursRows.length > 0 ? openingHoursRows : buildDefaultOpeningHours(currentTenantId));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar quadras');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsFetching(false);
          setOpeningHoursLoading(false);
          isFirstLoadRef.current = false;
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [tenantId, authLoading, refetchIndex]);

  const slots = useMemo(() => {
    const grouped: Record<string, CourtSlot[]> = {};
    for (const slot of allSlots) {
      (grouped[slot.court_id] ??= []).push(slot);
    }
    return grouped;
  }, [allSlots]);

  const toggleActive = useCallback(
    async (courtId: string, currentActive: boolean) => {
      if (!tenantId) return;
      const { error: updateError } = await supabase
        .from('courts')
        .update({ active: !currentActive })
        .eq('id', courtId)
        .eq('tenant_id', tenantId);
      if (updateError) {
        setError(updateError.message);
        throw updateError;
      }
      refetch();
    },
    [tenantId, refetch],
  );

  const createCourt = useCallback(
    async (data: CreateCourtInput) => {
      if (!tenantId) throw new Error('Nenhuma arena associada a este usuário.');
      const { data: created, error: insertError } = await supabase
        .from('courts')
        .insert({
          tenant_id: tenantId,
          name: data.name,
          sport_type: data.sport_type,
          price_per_hour: data.price_per_hour,
          active: data.active ?? true,
        })
        .select('*')
        .single();
      if (insertError) {
        setError(insertError.message);
        throw insertError;
      }
      refetch();
      return created as Court;
    },
    [tenantId, refetch],
  );

  const updateCourt = useCallback(
    async (courtId: string, data: UpdateCourtInput) => {
      if (!tenantId) return;
      const { error: updateError } = await supabase
        .from('courts')
        .update({ name: data.name, sport_type: data.sport_type, price_per_hour: data.price_per_hour })
        .eq('id', courtId)
        .eq('tenant_id', tenantId);
      if (updateError) {
        setError(updateError.message);
        throw updateError;
      }
      refetch();
    },
    [tenantId, refetch],
  );

  const deleteCourt = useCallback(
    async (courtId: string) => {
      if (!tenantId) return;
      const { error: deleteError } = await supabase.from('courts').delete().eq('id', courtId).eq('tenant_id', tenantId);
      if (deleteError) {
        setError(deleteError.message);
        throw deleteError;
      }
      refetch();
    },
    [tenantId, refetch],
  );

  const createSlot = useCallback(
    async (data: CreateSlotInput) => {
      if (!tenantId) return;
      const { error: insertError } = await supabase.from('court_slots').insert({
        court_id: data.court_id,
        tenant_id: tenantId,
        weekday: data.weekday,
        start_time: data.start_time,
        end_time: data.end_time,
        active: data.active ?? true,
      });
      if (insertError) {
        setError(insertError.message);
        throw insertError;
      }
      refetch();
    },
    [tenantId, refetch],
  );

  const deleteSlot = useCallback(
    async (slotId: string) => {
      if (!tenantId) return;
      const { error: deleteError } = await supabase.from('court_slots').delete().eq('id', slotId).eq('tenant_id', tenantId);
      if (deleteError) {
        setError(deleteError.message);
        throw deleteError;
      }
      refetch();
    },
    [tenantId, refetch],
  );

  const uploadCourtPhoto = useCallback(
    async (courtId: string, file: File) => {
      if (!tenantId) throw new Error('Nenhuma arena associada a este usuário.');

      const filename = `${tenantId}/${courtId}_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from('court-photos').upload(filename, file);
      if (uploadError) {
        setError(uploadError.message);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage.from('court-photos').getPublicUrl(filename);
      const photoUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from('courts')
        .update({ photo_url: photoUrl })
        .eq('id', courtId)
        .eq('tenant_id', tenantId);
      if (updateError) {
        setError(updateError.message);
        throw updateError;
      }

      refetch();
      return photoUrl;
    },
    [tenantId, refetch],
  );

  return {
    courts,
    slots,
    openingHours,
    loading,
    isFetching,
    openingHoursLoading,
    error,
    toggleActive,
    createCourt,
    updateCourt,
    deleteCourt,
    createSlot,
    deleteSlot,
    uploadCourtPhoto,
    refetch,
  };
}
