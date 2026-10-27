import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { useTenantBySlug } from '../hooks/useTenantBySlug';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const emptyForm: FormState = { fullName: '', email: '', phone: '', password: '', confirmPassword: '' };

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

export default function ClienteCadastro() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { tenant, loading: tenantLoading, error: tenantError } = useTenantBySlug(slug);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!tenant) return;

    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
      setError('Preencha todos os campos.');
      return;
    }
    if (!isValidPhone(form.phone)) {
      setError('Informe um telefone válido.');
      return;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
      });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Não foi possível concluir o cadastro. Verifique seu email para confirmar a conta.');

      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        tenant_id: tenant.id,
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        role: 'client',
      });
      if (profileError) throw profileError;

      navigate(`/${slug}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-50)] px-6 py-10">
      <Card className="w-full max-w-[420px] p-8">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Building2 size={28} strokeWidth={1.5} color="var(--color-primary)" />
          <span className="text-lg text-[var(--color-dark)]">
            {tenantLoading ? 'Carregando...' : (tenant?.name ?? 'Arena não encontrada')}
          </span>
        </div>

        {tenantError && !tenantLoading ? (
          <div className="text-center text-[13px] text-[var(--color-error)]">{tenantError}</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-[13px] text-[var(--color-dark)]">
                Nome completo
              </label>
              <Input
                id="fullName"
                placeholder="Seu nome"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] text-[var(--color-dark)]">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-[13px] text-[var(--color-dark)]">
                Telefone
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="(16) 99123-1111"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                required
                autoComplete="tel"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[13px] text-[var(--color-dark)]">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-[13px] text-[var(--color-dark)]">
                Confirmar senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" variant="primary" className="mt-2 w-full" disabled={submitting || tenantLoading}>
              {submitting ? 'Criando conta...' : 'Criar conta'}
            </Button>

            {error && <span className="text-[12px] text-[var(--color-error)]">{error}</span>}

            <div className="mt-2 text-center text-[13px] text-[var(--color-gray-600)]">
              Já tem conta?{' '}
              <Link to={`/${slug}/login`} className="font-medium text-[var(--color-primary)] no-underline">
                Entrar
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
