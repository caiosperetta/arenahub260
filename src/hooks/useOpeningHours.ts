import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { OpeningHours } from '../types';

interface DefaultHoursSpec {
  weekday: number;
  open_time: string;
  close_time: string;
  is_open: boolean;
}

const DEFAULT_HOURS_SPEC: DefaultHoursSpec[] = [
  { weekday: 0, open_time: '08:00:00', close_time: '18:00:00', is_open: false }, // Dom
  { weekday: 1, open_time: '08:00:00', close_time: '22:00:00', is_open: true }, // Seg
  { weekday: 2, open_time: '08:00:00', close_time: '22:00:00', is_open: true }, // Ter
  { weekday: 3, open_time: '08:00:00', close_time: '22:00:00', is_open: true }, // Qua
  { weekday: 4, open_time: '08:00:00', close_time: '22:00:00', is_open: true }, // Qui
  { weekday: 5, open_time: '08:00:00', close_time: '22:00:00', is_open: true }, // Sex
  { weekday: 6, open_time: '08:00:00', close_time: '18:00:00', is_open: true }, // Sáb
];

export function buildDefaultOpeningHours(tenantId: string): OpeningHours[] {
  return DEFAULT_HOURS_SPEC.map((spec) => ({
    id: `default-${spec.weekday}`,
    tenant_id: tenantId,
    created_at: '',
    ...spec,
  }));
}

interface UseOpeningHoursResult {
  hours: OpeningHours[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveOpeningHours: (hours: OpeningHours[]) => Promise<void>;
  refetch: () => void;
}

export function useOpeningHours(): UseOpeningHoursResult {
  const { profile, loading: authLoading } = useAuth();
  const tenantId = profile?.tenant_id ?? null;

  const [hours, setHours] = useState<OpeningHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refetchIndex, setRefetchIndex] = useState(0);

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
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const { data, error: fetchError } = await supabase
          .from('opening_hours')
          .select('*')
          .eq('tenant_id', currentTenantId)
          .order('weekday', { ascending: true });

        if (fetchError) throw fetchError;
        if (cancelled) return;

        const rows = (data ?? []) as OpeningHours[];
        setHours(rows.length > 0 ? rows : buildDefaultOpeningHours(currentTenantId));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar horário de funcionamento');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [tenantId, authLoading, refetchIndex]);

  const saveOpeningHours = useCallback(
    async (next: OpeningHours[]) => {
      if (!tenantId) return;

      setSaving(true);
      setError(null);

      try {
        const payload = next.map((h) => ({
          tenant_id: tenantId,
          weekday: h.weekday,
          open_time: h.open_time,
          close_time: h.close_time,
          is_open: h.is_open,
        }));

        const { data, error: upsertError } = await supabase
          .from('opening_hours')
          .upsert(payload, { onConflict: 'tenant_id,weekday' })
          .select('*')
          .order('weekday', { ascending: true });

        if (upsertError) throw upsertError;

        setHours((data ?? []) as OpeningHours[]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao salvar horário de funcionamento';
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [tenantId],
  );

  return { hours, loading, error, saving, saveOpeningHours, refetch };
}
