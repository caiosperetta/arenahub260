import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserRole = 'super_admin' | 'admin' | 'staff' | 'client';

export interface Profile {
  id: string;
  tenant_id: string | null;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  plan: 'basico' | 'profissional' | 'enterprise';
  active: boolean;
  created_at: string;
}

interface ProfileWithTenant extends Profile {
  tenant: Tenant | null;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  tenant: Tenant | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PROFILE_FETCH_TIMEOUT_MS = 8000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchingRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const queryPromise = supabase
        .from('profiles')
        .select('*, tenant:tenants(*)')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) => {
        setTimeout(() => resolve({ data: null, error: new Error('Tempo esgotado ao buscar perfil') }), PROFILE_FETCH_TIMEOUT_MS);
      });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error || !data) {
        setProfile(null);
        setTenant(null);
        return;
      }

      const { tenant: tenantData, ...profileData } = data as ProfileWithTenant;
      setProfile(profileData);
      setTenant(tenantData ?? null);
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setTenant(null);
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setTenant(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setProfile(null);
    setTenant(null);
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, tenant, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
}
