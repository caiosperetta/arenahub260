import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Tenant } from '../types';

interface UseConfiguracoesResult {
  tenant: Tenant | null;
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  saving: boolean;
  updateTenant: (data: Partial<Pick<Tenant, 'name' | 'slug' | 'primary_color' | 'logo_url'>>) => Promise<void>;
  uploadLogo: (file: File) => Promise<string>;
}

export function useConfiguracoes(): UseConfiguracoesResult {
  const { profile, loading: authLoading, refetchProfile } = useAuth();
  const tenantId = profile?.tenant_id ?? null;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isFirstLoadRef = useRef(true);

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
        const { data, error: fetchError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', tenantId)
          .single();

        if (fetchError) throw fetchError;
        if (cancelled) return;

        setTenant(data as Tenant);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar dados da arena');
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
  }, [tenantId, authLoading]);

  const updateTenant = useCallback(
    async (data: Partial<Pick<Tenant, 'name' | 'slug' | 'primary_color' | 'logo_url'>>) => {
      if (!tenantId) return;

      setSaving(true);
      setError(null);

      try {
        const { data: updated, error: updateError } = await supabase
          .from('tenants')
          .update(data)
          .eq('id', tenantId)
          .select('*')
          .single();

        if (updateError) throw updateError;

        setTenant(updated as Tenant);
        await refetchProfile();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao salvar configurações';
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [tenantId, refetchProfile],
  );

  const uploadLogo = useCallback(
    async (file: File) => {
      if (!tenantId) throw new Error('Nenhuma arena associada a este usuário.');

      const filename = `${tenantId}/logo_${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage.from('arena-logos').upload(filename, file);
      if (uploadError) {
        setError(uploadError.message);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage.from('arena-logos').getPublicUrl(filename);
      const logoUrl = publicUrlData.publicUrl;

      await updateTenant({ logo_url: logoUrl });
      return logoUrl;
    },
    [tenantId, updateTenant],
  );

  return { tenant, loading, isFetching, error, saving, updateTenant, uploadLogo };
}
