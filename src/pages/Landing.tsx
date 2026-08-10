import { useState } from 'react';
import {
  CircleCheck,
  ArrowRight,
  Check,
  MessageCircleOff,
  FileX,
  UserX,
  CalendarCheck,
  LayoutDashboard,
  Map,
  Wallet,
  Users,
  BarChart2,
  Building2,
  Settings,
  Share2,
  Layers,
  Zap,
  Building,
  Star,
  ChevronDown,
  AtSign,
  Link as LinkIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Button from '../components/Button';

const heroBars = [
  { name: 'Quadra 1', pct: 82, color: 'var(--color-primary)' },
  { name: 'Quadra 2', pct: 65, color: 'var(--color-cyan)' },
  { name: 'Quadra 3', pct: 90, color: 'var(--color-primary)' },
  { name: 'Quadra 4', pct: 48, color: 'var(--color-cyan)' },
];

const heroUpcoming = [
  { client: 'Maria Silva', court: 'Quadra 2', time: '19:00', label: 'Confirmado', bg: 'var(--color-success-bg)', color: 'var(--color-success-text)' },
  { client: 'Pedro Santos', court: 'Quadra 1', time: '20:00', label: 'Pendente', bg: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' },
  { client: 'Ana Costa', court: 'Quadra 3', time: '21:00', label: 'Confirmado', bg: 'var(--color-success-bg)', color: 'var(--color-success-text)' },
];

const socialProofNames = ['Arena Rossato', 'Espaço JM Beach', 'Arena Pires', 'Quadra Nova SP', 'Vôlei Total', 'Beach Center RP'];

interface IconCard {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const problems: IconCard[] = [
  { icon: MessageCircleOff, title: 'Reservas por WhatsApp', desc: 'Conflitos de horário, clientes sem confirmação, histórico perdido. Controlar tudo no celular não é gestão.' },
  { icon: FileX, title: 'Planilhas que travam', desc: 'Atualização manual, sem visão em tempo real, sem acesso mobile. A planilha não avisa quando a quadra está ocupada.' },
  { icon: UserX, title: 'Clientes sem autoatendimento', desc: 'Cada reserva depende de você disponível. Sem um portal próprio, sua arena não funciona quando você dorme.' },
];

const features: IconCard[] = [
  { icon: CalendarCheck, title: 'Reservas online', desc: 'Seus clientes escolhem a quadra, o horário e confirmam a reserva sem precisar falar com você.' },
  { icon: LayoutDashboard, title: 'Painel de controle', desc: 'Métricas de receita, ocupação e reservas em tempo real. Visão completa do dia em um só painel.' },
  { icon: Map, title: 'Mapa de quadras', desc: 'Visualize todas as quadras e horários em um grid interativo. Bloqueie, edite ou aprove com um clique.' },
  { icon: Wallet, title: 'Controle financeiro', desc: 'Receitas, mensalistas, inadimplência e relatórios por período. Sem planilha, sem surpresa.' },
  { icon: Users, title: 'Gestão de clientes', desc: 'Histórico completo, mensalistas recorrentes e lista de espera automática por quadra.' },
  { icon: BarChart2, title: 'Analytics', desc: 'Ocupação por quadra, receita por período e performance por tipo de esporte. Dados para decisão.' },
];

const steps = [
  { num: '01', icon: Building2, title: 'Crie sua arena', desc: 'Cadastre o nome, endereço e configure as quadras com tipo, preço e horários disponíveis.' },
  { num: '02', icon: Settings, title: 'Configure as regras', desc: 'Defina aprovação automática ou manual, bloqueios de horário, mensalistas e formas de pagamento.' },
  { num: '03', icon: Share2, title: 'Compartilhe o link', desc: 'Seus clientes acessam arenahub.com/suaarena e reservam sozinhos, pelo celular ou computador.' },
];

const experiences: { key: 'admin' | 'quadras' | 'portal'; label: string }[] = [
  { key: 'admin', label: 'Painel admin' },
  { key: 'quadras', label: 'Gestão de quadras' },
  { key: 'portal', label: 'Portal do cliente' },
];

const experienceLabelMap: Record<string, string> = {
  admin: 'screenshot do dashboard (dark)',
  quadras: 'screenshot do mapa / calendário',
  portal: 'screenshot da tela de reserva (light)',
};

interface PricingPlan {
  name: string;
  price: string;
  icon: LucideIcon;
  popular: boolean;
  items: string[];
  btnLabel: string;
  variant: 'primary' | 'secondary';
}

const pricing: PricingPlan[] = [
  {
    name: 'Básico',
    price: 'R$49',
    icon: Layers,
    popular: false,
    items: ['1 quadra', 'Reservas individuais', 'Portal do cliente', 'Relatórios básicos', 'Suporte por email'],
    btnLabel: 'Começar grátis',
    variant: 'secondary',
  },
  {
    name: 'Profissional',
    price: 'R$99',
    icon: Zap,
    popular: true,
    items: ['Até 5 quadras', 'Reservas semanais e mensais', 'Lista de espera automática', 'Eventos e torneios', 'Relatórios avançados', 'Suporte prioritário'],
    btnLabel: 'Começar grátis',
    variant: 'primary',
  },
  {
    name: 'Enterprise',
    price: 'R$199',
    icon: Building,
    popular: false,
    items: ['Quadras ilimitadas', 'Todos os recursos', 'Sincronização Google Calendar', 'Relatórios financeiros completos', 'Torneios', 'Modo pré-pago', 'Suporte dedicado'],
    btnLabel: 'Falar com vendas',
    variant: 'secondary',
  },
];

const testimonials = [
  { initials: 'CR', avatarBg: 'var(--color-primary-light)', name: 'Carlos Rezende', arena: 'Arena Rezende — Ribeirão Preto/SP', quote: 'Antes eu ficava o dia todo respondendo WhatsApp para confirmar horário. Hoje os clientes reservam sozinhos e eu recebo a notificação. Mudou completamente minha rotina.' },
  { initials: 'JM', avatarBg: 'var(--color-info-bg)', name: 'Juliana Martins', arena: 'Espaço JM Beach — Campinas/SP', quote: 'O controle financeiro era meu maior problema. Mensalistas atrasando, sem saber quem havia pago. Agora tenho tudo no painel e mando cobrança automática.' },
  { initials: 'RP', avatarBg: 'var(--color-warning-bg)', name: 'Roberto Pires', arena: 'Arena Pires — Franca/SP', quote: 'Implantei em uma tarde. No dia seguinte já tinha clientes reservando pelo link. A plataforma é muito mais simples do que eu esperava para tudo que entrega.' },
];

const faqs = [
  { question: 'Como funciona o período de teste?', answer: '14 dias completos com acesso a todos os recursos do plano Profissional. Sem cartão de crédito. Sem compromisso.' },
  { question: 'Meus clientes precisam criar conta para reservar?', answer: 'Sim — um cadastro simples com nome, email e telefone. O processo leva menos de um minuto e fica salvo para as próximas reservas.' },
  { question: 'Consigo migrar meus clientes atuais?', answer: 'Sim. Você pode importar sua base de clientes via planilha ou cadastrá-los manualmente. Nossa equipe ajuda no processo de migração.' },
  { question: 'O sistema funciona no celular?', answer: 'Totalmente. Tanto o painel do admin quanto o portal do cliente são responsivos e funcionam em qualquer dispositivo.' },
  { question: 'Posso ter mais de uma unidade?', answer: 'Sim. O plano Enterprise suporta múltiplas unidades com um único login de gerenciamento.' },
  { question: 'Como funciona o pagamento dos clientes?', answer: 'O ArenaHub gerencia as reservas. A integração com gateway de pagamento está disponível no plano Profissional e Enterprise.' },
  { question: 'Posso personalizar o portal com a identidade da minha arena?', answer: 'Sim — nome, logo e cor principal são configuráveis. O portal fica em arenahub.com/suaarena.' },
];

const footerCols = [
  { title: 'Produto', links: ['Funcionalidades', 'Preços', 'Demonstração', 'Novidades'] },
  { title: 'Empresa', links: ['Sobre', 'Blog', 'Contato', 'Trabalhe conosco'] },
  { title: 'Suporte', links: ['Central de ajuda', 'Documentação', 'Status do sistema', 'LGPD'] },
  { title: 'Legal', links: ['Termos de uso', 'Política de privacidade', 'Segurança'] },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);
  const [experience, setExperience] = useState<'admin' | 'quadras' | 'portal'>('admin');

  return (
    <div className="flex flex-col text-[var(--color-dark)]">
      {/* HERO */}
      <section className="mx-auto flex max-w-[1280px] items-center gap-16 px-20 py-[120px]">
        <div className="w-[55%]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-gray-100)] px-3.5 py-1.5">
            <CircleCheck size={16} strokeWidth={1.5} color="var(--color-primary)" />
            <span className="text-[13px] font-medium text-[var(--color-dark)]">
              Plataforma profissional para gestão de arenas esportivas
            </span>
          </div>
          <h1 className="mb-6 text-[52px] leading-[1.3] tracking-[-1px] text-[var(--color-dark)]">
            Gerencie sua arena com tecnologia de verdade
          </h1>
          <p className="mb-10 max-w-[520px] text-lg leading-relaxed text-[var(--color-gray-600)]">
            Reservas online, controle financeiro, gestão de clientes e quadras — tudo em um só painel. Sem
            WhatsApp. Sem planilha.
          </p>
          <div className="mb-8 flex gap-4">
            <Button variant="primary">
              Começar grátis
              <ArrowRight size={18} strokeWidth={1.5} />
            </Button>
            <Button variant="secondary">Ver demonstração</Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-gray-400)]">
            <span className="flex items-center gap-1.5">
              <Check size={14} strokeWidth={1.5} />
              Sem cartão de crédito
            </span>
            <span className="ml-2 flex items-center gap-1.5">
              <Check size={14} strokeWidth={1.5} />
              Cancele quando quiser
            </span>
            <span className="ml-2 flex items-center gap-1.5">
              <Check size={14} strokeWidth={1.5} />
              Configuração em 5 minutos
            </span>
          </div>
        </div>

        <div className="w-[45%]">
          <div className="flex flex-col gap-4 rounded-[var(--radius-xl)] bg-[var(--color-dark)] p-6">
            <div className="flex gap-3">
              <div className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-3.5">
                <div className="text-xs text-[rgba(255,255,255,0.5)]">Receita hoje</div>
                <div className="mt-1.5 text-xl text-white">R$840</div>
              </div>
              <div className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-3.5">
                <div className="text-xs text-[rgba(255,255,255,0.5)]">Reservas</div>
                <div className="mt-1.5 text-xl text-white">14</div>
              </div>
              <div className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-3.5">
                <div className="text-xs text-[rgba(255,255,255,0.5)]">Ocupação</div>
                <div className="mt-1.5 text-xl text-white">78%</div>
              </div>
            </div>

            <div className="rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-4">
              <div className="mb-3 text-[13px] text-[rgba(255,255,255,0.7)]">Ocupação por quadra</div>
              {heroBars.map((b) => (
                <div key={b.name} className="mb-2 flex items-center gap-2.5">
                  <span className="w-16 text-xs text-[rgba(255,255,255,0.5)]">{b.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-[4px] bg-[rgba(255,255,255,0.08)]">
                    <div className="h-2 rounded-[4px]" style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
                  </div>
                  <span className="w-7 text-xs text-[rgba(255,255,255,0.5)]">{b.pct}%</span>
                </div>
              ))}
            </div>

            <div className="rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-4">
              <div className="mb-3 text-[13px] text-[rgba(255,255,255,0.7)]">Próximas reservas</div>
              {heroUpcoming.map((r, i) => (
                <div
                  key={r.client}
                  className={`flex items-center justify-between py-2 ${i > 0 ? 'border-t border-[rgba(255,255,255,0.06)]' : ''}`}
                >
                  <div>
                    <div className="text-[13px] text-white">{r.client}</div>
                    <div className="text-[11px] text-[rgba(255,255,255,0.4)]">
                      {r.court} · {r.time}
                    </div>
                  </div>
                  <span
                    className="rounded-[var(--radius-full)] px-2.5 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: r.bg, color: r.color }}
                  >
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-[var(--color-gray-100)] py-6 text-center">
        <div className="mb-4 text-xs text-[var(--color-gray-600)]">Mais de 200 arenas esportivas em todo o Brasil</div>
        <div className="flex justify-center items-center">
          {socialProofNames.map((name, i) => (
            <span
              key={name}
              className={`px-5 text-sm font-medium text-[var(--color-gray-400)] ${i < socialProofNames.length - 1 ? 'border-r border-[#CBD5E1]' : ''}`}
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="mx-auto max-w-[1280px] px-20 py-[100px] text-center">
        <h2 className="mb-3 text-[32px] text-[var(--color-dark)]">Sua arena ainda funciona no improviso?</h2>
        <p className="mx-auto mb-14 max-w-[600px] text-base text-[var(--color-gray-600)]">
          WhatsApp, planilha e anotações no papel custam caro — em tempo, em erros e em clientes perdidos.
        </p>
        <div className="grid grid-cols-3 gap-6 text-left">
          {problems.map((p) => (
            <div key={p.title} className="rounded-[14px] border-[0.5px] border-[var(--color-gray-200)] bg-white p-7 shadow-[var(--shadow-card)]">
              <p.icon size={24} strokeWidth={1.5} color="var(--color-gray-400)" className="mb-4" />
              <h3 className="mb-2 text-lg text-[var(--color-dark)]">{p.title}</h3>
              <p className="text-[15px] leading-relaxed text-[var(--color-gray-600)]">{p.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-base font-medium text-[var(--color-dark)]">O ArenaHub resolve cada um desses problemas.</p>
          <Button variant="ghost">Ver como funciona</Button>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funcionalidades" className="bg-[var(--color-gray-100)] py-[100px]">
        <div className="mx-auto max-w-[1280px] px-20">
          <h2 className="mb-12 text-center text-[32px] text-[var(--color-dark)]">
            Tudo que sua arena precisa, em um lugar só
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-[14px] border-[0.5px] border-[var(--color-gray-200)] bg-white p-7">
                <f.icon size={24} strokeWidth={1.5} color="var(--color-primary)" className="mb-4" />
                <h3 className="mb-2 text-lg text-[var(--color-dark)]">{f.title}</h3>
                <p className="text-[15px] leading-relaxed text-[var(--color-gray-600)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-[1280px] px-20 py-[100px]">
        <h2 className="mb-14 text-center text-[32px] text-[var(--color-dark)]">
          Comece a operar em menos de um dia
        </h2>
        <div className="flex">
          {steps.map((s, i) => (
            <div key={s.num} className="relative flex-1 px-6">
              {i < steps.length - 1 && (
                <div className="absolute left-[-12px] top-5 z-0 w-[calc(100%+24px)] border-t-2 border-dashed border-[var(--color-gray-200)]" />
              )}
              <div className="relative z-10">
                <div className="mb-4 text-[32px] text-[var(--color-primary)]">{s.num}</div>
                <s.icon size={24} strokeWidth={1.5} color="var(--color-dark)" className="mb-3" />
                <h3 className="mb-2 text-lg text-[var(--color-dark)]">{s.title}</h3>
                <p className="text-[15px] leading-relaxed text-[var(--color-gray-600)]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SCREENSHOT / TABS */}
      <section className="bg-[var(--color-dark)] py-[100px]">
        <div className="mx-auto max-w-[1280px] px-20 text-center">
          <h2 className="mb-3 text-[32px] text-white">Uma plataforma. Três experiências.</h2>
          <p className="mb-12 text-base text-[rgba(255,255,255,0.6)]">
            Do painel do administrador ao portal do cliente — tudo integrado.
          </p>
          <div className="mb-8 flex justify-center gap-3">
            {experiences.map((e) => (
              <button
                key={e.key}
                onClick={() => setExperience(e.key)}
                className="cursor-pointer rounded-[var(--radius-md)] border px-6 py-3 text-sm font-medium"
                style={{
                  backgroundColor: experience === e.key ? 'var(--color-primary)' : 'transparent',
                  borderColor: experience === e.key ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)',
                  color: experience === e.key ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                }}
              >
                {e.label}
              </button>
            ))}
          </div>
          <div
            className="flex h-[420px] items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 12px)',
            }}
          >
            <span className="font-mono text-[13px] text-[rgba(255,255,255,0.4)]">{experienceLabelMap[experience]}</span>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="bg-[var(--color-gray-100)] py-[100px]">
        <div className="mx-auto max-w-[1280px] px-20 text-center">
          <h2 className="mb-3 text-[32px] text-[var(--color-dark)]">Planos simples, sem surpresas</h2>
          <p className="mb-14 text-base text-[var(--color-gray-600)]">
            Escale conforme sua arena cresce. Sem fidelidade, cancele quando quiser.
          </p>
          <div className="grid grid-cols-3 gap-6 text-left">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-[14px] bg-white p-8"
                style={{ border: plan.popular ? '2px solid var(--color-primary)' : '0.5px solid var(--color-gray-200)' }}
              >
                {plan.popular && (
                  <span className="absolute right-6 top-6 rounded-[var(--radius-full)] bg-[var(--color-success-bg)] px-3 py-1 text-xs font-medium text-[var(--color-success-text)]">
                    Mais popular
                  </span>
                )}
                <plan.icon size={24} strokeWidth={1.5} color="var(--color-primary)" className="mb-5" />
                <h3 className="mb-1 text-lg text-[var(--color-dark)]">{plan.name}</h3>
                <div className="mb-6 text-[32px] text-[var(--color-dark)]">
                  {plan.price}
                  <span className="text-[15px] text-[var(--color-gray-600)]">/mês</span>
                </div>
                {plan.items.map((item) => (
                  <div key={item} className="mb-3 flex items-center gap-2">
                    <Check size={16} strokeWidth={1.5} color="var(--color-primary)" />
                    <span className="text-sm text-[var(--color-dark)]">{item}</span>
                  </div>
                ))}
                <Button variant={plan.variant} className="mt-3 w-full">
                  {plan.btnLabel}
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-6 text-[13px] text-[var(--color-gray-600)]">
            <span className="flex items-center gap-1.5">
              <Check size={14} strokeWidth={1.5} color="var(--color-primary)" />
              Todos os planos incluem 14 dias de teste grátis
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} strokeWidth={1.5} color="var(--color-primary)" />
              Sem fidelidade
            </span>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="depoimentos" className="mx-auto max-w-[1280px] px-20 py-[100px]">
        <h2 className="mb-12 text-center text-[32px] text-[var(--color-dark)]">O que os gestores dizem</h2>
        <div className="grid grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-[14px] border-[0.5px] border-[var(--color-gray-200)] bg-white p-7">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-[var(--color-dark)]"
                  style={{ backgroundColor: t.avatarBg }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-[15px] font-medium text-[var(--color-dark)]">{t.name}</div>
                  <div className="text-[13px] text-[var(--color-gray-600)]">{t.arena}</div>
                </div>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-[var(--color-dark)]">{t.quote}</p>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} strokeWidth={1.5} color="var(--color-primary)" fill="var(--color-primary)" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[var(--color-gray-100)] py-[100px]">
        <div className="mx-auto max-w-[800px] px-6">
          <h2 className="mb-12 text-center text-[32px] text-[var(--color-dark)]">Dúvidas frequentes</h2>
          {faqs.map((q, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={q.question} className="mb-3 overflow-hidden rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-gray-200)] bg-white">
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : i)}
                  className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-5 py-[18px] text-left"
                >
                  <span className="text-[15px] font-medium text-[var(--color-dark)]">{q.question}</span>
                  <ChevronDown
                    size={18}
                    strokeWidth={1.5}
                    color="var(--color-gray-600)"
                    className="transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-[18px] text-sm leading-relaxed text-[var(--color-gray-600)]">{q.answer}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-[var(--color-dark)] py-[100px] text-center">
        <h2 className="mb-3 text-[40px] tracking-[-0.5px] text-white">Pronto para profissionalizar sua arena?</h2>
        <p className="mb-8 text-base text-[rgba(255,255,255,0.6)]">
          Junte-se a centenas de arenas que já trocaram o WhatsApp por uma plataforma de verdade.
        </p>
        <Button variant="primary" className="px-8 py-3.5 text-base">
          Começar grátis agora
        </Button>
        <div className="mt-6 flex justify-center gap-5 text-xs text-[rgba(255,255,255,0.4)]">
          <span className="flex items-center gap-1.5">
            <Check size={14} strokeWidth={1.5} />
            Sem cartão
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={14} strokeWidth={1.5} />
            14 dias grátis
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={14} strokeWidth={1.5} />
            Cancele quando quiser
          </span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[var(--color-dark)] px-20 py-16">
        <div className="mx-auto flex max-w-[1280px] justify-between gap-10">
          <div className="w-[280px]">
            <div className="mb-3 flex items-center gap-2">
              <Building2 size={20} strokeWidth={1.5} color="var(--color-primary)" />
              <span className="text-base text-white">
                Arena<span className="font-medium text-[var(--color-primary)]">Hub</span>
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-[rgba(255,255,255,0.5)]">
              Gestão profissional para arenas esportivas
            </p>
          </div>
          {footerCols.map((col) => (
            <div key={col.title} className="w-[160px]">
              <div className="mb-4 text-[13px] font-medium text-white">{col.title}</div>
              {col.links.map((link) => (
                <div key={link} className="mb-3">
                  <a href="#" className="text-[13px] text-[rgba(255,255,255,0.5)] no-underline">
                    {link}
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 flex max-w-[1280px] items-center justify-between border-t border-[rgba(255,255,255,0.08)] pt-6">
          <span className="text-xs text-[rgba(255,255,255,0.4)]">© 2026 ArenaHub. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <AtSign size={18} strokeWidth={1.5} color="rgba(255,255,255,0.4)" />
            <LinkIcon size={18} strokeWidth={1.5} color="rgba(255,255,255,0.4)" />
          </div>
        </div>
      </footer>
    </div>
  );
}
