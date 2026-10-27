import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Tenant } from '../types';

interface UseTenantBySlugResult {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
}

export function useTenantBySlug(slug: string | undefined): UseTenantBySlugResult {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setTenant(null);
      setError('Arena não encontrada');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      const { data, error: fetchError } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug as string)
        .eq('active', true)
        .single();

      if (cancelled) return;

      if (fetchError || !data) {
        setTenant(null);
        setError('Arena não encontrada');
      } else {
        setTenant(data);
      }
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { tenant, loading, error };
}
