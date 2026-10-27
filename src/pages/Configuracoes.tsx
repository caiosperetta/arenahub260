import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Image, Users } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ToggleSwitch from '../components/Toggle';
import { cn } from '../lib/cn';
import { useAdminHeader } from '../layouts/AdminHeaderContext';
import { useAuth } from '../contexts/AuthContext';
import { useConfiguracoes } from '../hooks/useConfiguracoes';
import { useOpeningHours } from '../hooks/useOpeningHours';
import { SkeletonCard, SkeletonForm } from '../components/Skeletons';
import { supabase } from '../lib/supabase';
import type { OpeningHours, Profile, Tenant, TenantPlan } from '../types';

const tabs = ['Dados da arena', 'Plano', 'Equipe e permissões', 'Horários', 'Notificações'];
const tabIcons: Partial<Record<string, typeof Clock>> = { Horários: Clock };

const weekdayFullLabels = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

function timeSelectClassName() {
  return 'rounded-[var(--radius-sm)] border-[0.5px] border-[#CBD5E1] bg-white px-3 py-2 text-[13px] text-[var(--color-dark)] outline-none transition-colors focus:border-[1.5px] focus:border-[var(--color-primary)]';
}

const SLUG_REGEX = /^[a-z0-9-]+$/;
const SLUG_ERROR_MESSAGE = 'Use apenas letras minúsculas, números e hífens';

const PLAN_LABELS: Record<TenantPlan, string> = {
  basico: 'Básico',
  profissional: 'Profissional',
  enterprise: 'Enterprise',
};

const PLAN_LIMITS: Record<TenantPlan, string[]> = {
  basico: ['1 quadra', 'Reservas avulsas apenas'],
  profissional: ['Até 5 quadras', 'Reservas semanais/mensais', 'Lista de espera', 'Eventos'],
  enterprise: ['Quadras ilimitadas', 'Todos os recursos', 'Google Calendar', 'Relatórios completos'],
};

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string | null;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] text-[var(--color-dark)]">{label}</label>
      {children}
      {error && <div className="mt-1 text-xs text-[var(--color-error)]">{error}</div>}
    </div>
  );
}

interface ConfiguracoesData {
  tenant: Tenant | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  updateTenant: (data: Partial<Pick<Tenant, 'name' | 'slug' | 'primary_color' | 'logo_url'>>) => Promise<void>;
  uploadLogo: (file: File) => Promise<string>;
}

function DadosDaArenaTab({ tenant, loading, saving, error, updateTenant, uploadLogo }: ConfiguracoesData) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'success'>('idle');

  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setSlug(tenant.slug);
      setColor(tenant.primary_color);
      setLogoPreview((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return tenant.logo_url ?? null;
      });
    }
  }, [tenant]);

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setSubmitError(null);
    setSaveState('idle');

    if (!SLUG_REGEX.test(slug)) {
      setSlugError(SLUG_ERROR_MESSAGE);
      return;
    }
    setSlugError(null);

    try {
      if (logoFile) {
        await uploadLogo(logoFile);
        setLogoFile(null);
      }
      await updateTenant({ name: name.trim(), slug, primary_color: color });
      setSaveState('success');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar configurações');
    }
  }

  if (loading) {
    return (
      <Card>
        <SkeletonCard className="h-5 w-40 mb-6" />
        <SkeletonForm fields={3} />
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-5 text-[15px] text-[var(--color-dark)]">Dados da arena</div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 min-w-16 items-center justify-center rounded-[var(--radius-lg)] border-[0.5px] border-dashed border-[#CBD5E1] bg-[var(--color-gray-100)] px-3">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo da arena" className="h-[60px] w-auto object-contain" />
          ) : (
            <Image size={22} strokeWidth={1.5} color="var(--color-gray-400)" />
          )}
        </div>
        <div>
          <label
            htmlFor="tenant-logo-input"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-[#CBD5E1] bg-transparent px-3.5 py-2 text-[13px] text-[var(--color-dark)] transition-colors hover:bg-[var(--color-gray-50)]"
          >
            Carregar logo
          </label>
          <input id="tenant-logo-input" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
          <div className="mt-1.5 text-xs text-[var(--color-gray-400)]">PNG ou JPG, até 2MB</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <Field label="Nome da arena">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Slug" error={slugError}>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugError(null);
              }}
              required
            />
          </Field>
        </div>

        <div className="mb-4">
          <Field label="Cor principal">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-10 shrink-0 cursor-pointer rounded-[var(--radius-sm)] border-none bg-transparent p-0 [&::-webkit-color-swatch]:rounded-[var(--radius-sm)] [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
              />
              <Input value={color} onChange={(e) => setColor(e.target.value)} className="max-w-[160px]" />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-[var(--color-gray-400)]">Pré-visualização:</span>
              <button
                type="button"
                tabIndex={-1}
                className="cursor-default rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: color }}
              >
                Botão de exemplo
              </button>
            </div>
          </Field>
        </div>

        <div className="mb-6">
          <Field label="Plano atual">
            <Badge status="info">{PLAN_LABELS[tenant?.plan ?? 'basico']}</Badge>
          </Field>
        </div>

        <div className="flex flex-col items-end gap-2 border-t border-[var(--color-gray-100)] pt-5">
          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              variant={submitError ? 'destructive' : 'primary'}
              disabled={saving}
              className={saveState === 'success' ? 'bg-[var(--color-primary)]' : undefined}
            >
              {saving ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Salvando...
                </>
              ) : saveState === 'success' ? (
                <>
                  <CheckCircle2 size={16} strokeWidth={1.5} />
                  Salvo!
                </>
              ) : (
                'Salvar alterações'
              )}
            </Button>
          </div>
          {(submitError || error) && (
            <span className="text-xs text-[var(--color-error)]">{submitError ?? error}</span>
          )}
        </div>
      </form>
    </Card>
  );
}

function PlanoTab({ tenant, loading }: Pick<ConfiguracoesData, 'tenant' | 'loading'>) {
  if (loading || !tenant) {
    return (
      <Card>
        <SkeletonCard className="h-24" />
      </Card>
    );
  }

  const planLabel = PLAN_LABELS[tenant.plan];
  const limits = PLAN_LIMITS[tenant.plan];

  return (
    <Card>
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[15px] text-[var(--color-dark)]">Plano atual</div>
        <Badge status="info">{planLabel}</Badge>
      </div>

      <ul className="my-5 flex flex-col gap-2 border-t border-[var(--color-gray-100)] pt-5">
        {limits.map((limit) => (
          <li key={limit} className="flex items-center gap-2 text-sm text-[var(--color-dark)]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
            {limit}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-4 border-t border-[var(--color-gray-100)] pt-5">
        <div className="text-xs text-[var(--color-gray-400)]">
          Para alterar seu plano, entre em contato com o suporte.
        </div>
        <Button type="button" variant="primary" onClick={() => alert('Em breve')}>
          Fazer upgrade
        </Button>
      </div>
    </Card>
  );
}

function EquipeTab() {
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id ?? null;

  const [staff, setStaff] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', tenantId)
        .in('role', ['admin', 'staff'])
        .order('full_name');

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setStaff((data ?? []) as Profile[]);
      }
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  if (loading) {
    return (
      <Card>
        <SkeletonCard className="h-16" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="text-sm text-[var(--color-error-text)]">{error}</Card>
    );
  }

  return (
    <Card>
      <div className="mb-5 text-[15px] text-[var(--color-dark)]">Equipe e permissões</div>

      {staff.length <= 1 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-dashed border-[var(--color-gray-200)] py-10 text-[var(--color-gray-400)]">
          <Users size={22} strokeWidth={1.5} />
          <span className="text-sm">Você é o único membro da equipe até o momento</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 border-b border-[var(--color-gray-100)] pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-medium text-[var(--color-primary)]">
                  {getInitials(member.full_name)}
                </div>
                <span className="text-sm text-[var(--color-dark)]">{member.full_name}</span>
              </div>
              <Badge status={member.role === 'admin' ? 'info' : 'inactive'}>
                {member.role === 'admin' ? 'Admin' : 'Staff'}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 border-t border-[var(--color-gray-100)] pt-4 text-xs text-[var(--color-gray-400)]">
        Novos membros da equipe são adicionados via painel de administração.
      </div>
    </Card>
  );
}

interface OpeningHoursData {
  hours: OpeningHours[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveOpeningHours: (hours: OpeningHours[]) => Promise<void>;
}

function HorariosTab({ hours, loading, saving, error, saveOpeningHours }: OpeningHoursData) {
  const [rows, setRows] = useState<OpeningHours[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'success'>('idle');

  useEffect(() => {
    if (hours.length > 0) {
      setRows([...hours].sort((a, b) => a.weekday - b.weekday));
    }
  }, [hours]);

  function updateRow(weekday: number, patch: Partial<OpeningHours>) {
    setSaveState('idle');
    setRows((prev) => prev.map((row) => (row.weekday === weekday ? { ...row, ...patch } : row)));
  }

  function handleApplyToWeekdays() {
    const reference = rows.find((row) => row.is_open);
    if (!reference) return;
    setSaveState('idle');
    setRows((prev) =>
      prev.map((row) =>
        row.weekday >= 1 && row.weekday <= 5
          ? { ...row, is_open: true, open_time: reference.open_time, close_time: reference.close_time }
          : row,
      ),
    );
  }

  async function handleSave() {
    setSubmitError(null);
    setSaveState('idle');
    try {
      await saveOpeningHours(rows);
      setSaveState('success');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar horário de funcionamento');
    }
  }

  if (loading) {
    return (
      <Card>
        <SkeletonCard className="h-5 w-40" />
        <div className="mt-6 flex flex-col gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonCard key={i} className="h-12" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[15px] text-[var(--color-dark)]">Horário de funcionamento</div>
        <Button type="button" variant="secondary" className="px-3 py-1.5 text-[13px]" onClick={handleApplyToWeekdays}>
          Aplicar a todos os dias úteis
        </Button>
      </div>
      <div className="mb-5 text-xs text-[var(--color-gray-400)]">
        Define os dias e horários em que sua arena aceita reservas. Ao editar a agenda de uma quadra, os horários dentro deste
        intervalo já vêm selecionados.
      </div>

      <div className="overflow-hidden rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-gray-200)]">
        {rows.map((row, index) => (
          <div
            key={row.weekday}
            className={cn(
              'flex items-center justify-between gap-4 px-4 py-3',
              index % 2 === 1 && 'bg-[var(--color-gray-50)]',
              index > 0 && 'border-t border-[var(--color-gray-100)]',
            )}
          >
            <span className="w-[110px] shrink-0 text-sm text-[var(--color-dark)]">{weekdayFullLabels[row.weekday]}</span>

            <div className="flex flex-1 items-center">
              <AnimatePresence mode="wait" initial={false}>
                {row.is_open ? (
                  <motion.div
                    key="times"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <select
                      value={row.open_time.slice(0, 5)}
                      onChange={(e) => updateRow(row.weekday, { open_time: `${e.target.value}:00` })}
                      className={timeSelectClassName()}
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-[var(--color-gray-400)]">até</span>
                    <select
                      value={row.close_time.slice(0, 5)}
                      onChange={(e) => updateRow(row.weekday, { close_time: `${e.target.value}:00` })}
                      className={timeSelectClassName()}
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                ) : (
                  <motion.span
                    key="closed"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    className="text-[13px] text-[var(--color-gray-400)]"
                  >
                    Fechado
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <ToggleSwitch on={row.is_open} onToggle={() => updateRow(row.weekday, { is_open: !row.is_open })} />
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col items-end gap-2 border-t border-[var(--color-gray-100)] pt-5">
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant={submitError ? 'destructive' : 'primary'}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Salvando...
              </>
            ) : saveState === 'success' ? (
              <>
                <CheckCircle2 size={16} strokeWidth={1.5} />
                Salvo!
              </>
            ) : (
              'Salvar horários'
            )}
          </Button>
        </div>
        {(submitError || error) && <span className="text-xs text-[var(--color-error)]">{submitError ?? error}</span>}
      </div>
    </Card>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 cursor-pointer rounded-[var(--radius-full)] border-none transition-colors',
        checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-gray-200)]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

interface NotificationSettings {
  newBooking: boolean;
  cancellation: boolean;
  dailySummary: boolean;
  overdueAlerts: boolean;
}

const NOTIFICATION_ITEMS: { key: keyof NotificationSettings; label: string }[] = [
  { key: 'newBooking', label: 'Notificação de nova reserva' },
  { key: 'cancellation', label: 'Notificação de cancelamento' },
  { key: 'dailySummary', label: 'Resumo diário por email' },
  { key: 'overdueAlerts', label: 'Alertas de inadimplência' },
];

function NotificacoesTab() {
  const [settings, setSettings] = useState<NotificationSettings>({
    newBooking: true,
    cancellation: true,
    dailySummary: false,
    overdueAlerts: true,
  });

  return (
    <Card>
      <div className="mb-5 text-[15px] text-[var(--color-dark)]">Notificações</div>

      <div className="mb-5 rounded-[var(--radius-md)] bg-[var(--color-info-bg)] px-4 py-2.5 text-sm text-[var(--color-info-text)]">
        Configurações de notificação serão salvas em breve.
      </div>

      <div className="flex flex-col gap-4">
        {NOTIFICATION_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-4">
            <span className="text-sm text-[var(--color-dark)]">{item.label}</span>
            <Toggle
              checked={settings[item.key]}
              onChange={(value) => setSettings((prev) => ({ ...prev, [item.key]: value }))}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Configuracoes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = useMemo(() => {
    const tabParam = searchParams.get('tab');
    return tabParam && tabs.includes(tabParam) ? tabParam : tabs[0];
  }, [searchParams]);
  const [activeTab, setActiveTab] = useState(initialTab);
  const configuracoes = useConfiguracoes();
  const openingHours = useOpeningHours();

  useAdminHeader({ title: 'Configurações' });

  function handleTabClick(tab: string) {
    setActiveTab(tab);
    setSearchParams(tab === tabs[0] ? {} : { tab });
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col">
      <div className="-mx-8 -mt-8 flex gap-7 border-b border-[var(--color-gray-200)] bg-white px-8">
        {tabs.map((tab) => {
          const Icon = tabIcons[tab];
          return (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 border-none border-b-2 bg-transparent pb-3 pt-4 text-sm transition-colors',
                activeTab === tab
                  ? 'border-[var(--color-primary)] font-medium text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--color-gray-600)] hover:text-[var(--color-dark)]',
              )}
            >
              {Icon && <Icon size={14} strokeWidth={1.5} />}
              {tab}
            </button>
          );
        })}
      </div>

      <div className="max-w-[720px] pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'Dados da arena' && <DadosDaArenaTab {...configuracoes} />}
            {activeTab === 'Plano' && <PlanoTab tenant={configuracoes.tenant} loading={configuracoes.loading} />}
            {activeTab === 'Equipe e permissões' && <EquipeTab />}
            {activeTab === 'Horários' && <HorariosTab {...openingHours} />}
            {activeTab === 'Notificações' && <NotificacoesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
