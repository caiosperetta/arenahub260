import { useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import {
  CircleCheck,
  ArrowRight,
  Check,
  MessageCircleOff,
  FileX,
  UserX,
  Calendar,
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
  ChevronDown,
  AtSign,
  Link as LinkIcon,
  RefreshCw,
  ListOrdered,
  Trophy,
  TrendingUp,
  Clock,
  XCircle,
  MessageCircle,
  CheckCircle,
  Shield,
  Database,
  FileText,
  Scale,
  Goal,
  Sun,
  Volleyball,
  Target,
  CircleDot,
  LayoutGrid,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Button from '../components/Button';
import { Reveal, RevealItem } from '../components/motion/Reveal';
import { CountUp } from '../components/motion/CountUp';
import { fadeInUp, popIn, viewportOnce, EASE_OUT } from '../lib/motion';
import { WHATSAPP_URL, openWhatsApp } from '../lib/whatsapp';

const heroWords = [
  { text: 'Sua', accent: false },
  { text: 'arena', accent: false },
  { text: 'organizada.', accent: true },
  { text: 'Suas', accent: false },
  { text: 'reservas', accent: false },
  { text: 'automatizadas.', accent: true },
];

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

const heroStatusBreakdown = [
  { label: 'confirmadas', value: 8, color: 'var(--color-success)' },
  { label: 'pendentes', value: 4, color: 'var(--color-warning)' },
  { label: 'canceladas', value: 2, color: 'var(--color-error)' },
];

interface IconStat {
  icon: LucideIcon;
  title: string;
  caption: string;
}

const platformStats: IconStat[] = [
  { icon: LayoutDashboard, title: '1 plataforma', caption: 'Gestão completa' },
  { icon: Clock, title: '24/7', caption: 'Reservas online' },
  { icon: Smartphone, title: '100% online', caption: 'Qualquer dispositivo' },
  { icon: ShieldCheck, title: 'Dados protegidos', caption: 'Segurança desde o início' },
];

const sportTypes: { icon: LucideIcon; label: string }[] = [
  { icon: Goal, label: 'Society' },
  { icon: Sun, label: 'Beach Tennis' },
  { icon: Volleyball, label: 'Vôlei' },
  { icon: Target, label: 'Tênis' },
  { icon: CircleDot, label: 'Futebol' },
  { icon: LayoutGrid, label: 'Complexos esportivos' },
];

interface IconCard {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const problems: IconCard[] = [
  { icon: MessageCircleOff, title: 'Reservas por WhatsApp', desc: 'Conflitos de horário, clientes sem confirmação e histórico perdido. Controlar tudo pelo celular não é gestão.' },
  { icon: FileX, title: 'Planilhas que travam', desc: 'Atualização manual, falta de visão em tempo real e dificuldade para acompanhar a operação.' },
  { icon: UserX, title: 'Clientes sem autoatendimento', desc: 'Cada reserva depende de alguém disponível para responder. Sem um portal próprio, sua arena depende da sua equipe para funcionar.' },
  { icon: Calendar, title: 'Horários difíceis de controlar', desc: 'Alterações, bloqueios e reservas recorrentes podem virar uma confusão quando tudo depende de mensagens e anotações.' },
];

const features: IconCard[] = [
  { icon: CalendarCheck, title: 'Reservas online', desc: 'Seus clientes escolhem a quadra, data e horário diretamente pelo portal.' },
  { icon: Calendar, title: 'Calendário inteligente', desc: 'Visualize disponibilidade, reservas, bloqueios e horários recorrentes em uma única agenda.' },
  { icon: Map, title: 'Gestão de quadras', desc: 'Configure preços, horários, tipos de quadra e disponibilidade.' },
  { icon: Users, title: 'Gestão de clientes', desc: 'Histórico, reservas, status, bloqueios e informações dos clientes.' },
  { icon: RefreshCw, title: 'Reservas recorrentes', desc: 'Organize grupos semanais, mensalistas e horários fixos.' },
  { icon: ListOrdered, title: 'Lista de espera', desc: 'Quando um horário ficar disponível, o sistema organiza automaticamente a fila de interessados.' },
  { icon: Trophy, title: 'Eventos e torneios', desc: 'Organize campeonatos, eventos e atividades especiais da arena.' },
  { icon: Wallet, title: 'Gestão financeira', desc: 'Acompanhe receitas, pagamentos, inadimplência e desempenho da arena.' },
];

interface AnalyticsCard extends IconCard {
  iconColor: string;
  iconBg: string;
}

const analyticsCards: AnalyticsCard[] = [
  { icon: BarChart2, title: 'Taxa de ocupação', desc: 'Veja quais quadras e horários têm mais demanda.', iconColor: 'var(--color-cyan)', iconBg: 'rgba(6,182,212,0.1)' },
  { icon: TrendingUp, title: 'Receita por quadra', desc: 'Entenda qual quadra gera mais receita.', iconColor: 'var(--color-primary)', iconBg: 'var(--color-primary-light)' },
  { icon: Clock, title: 'Horários mais procurados', desc: 'Descubra os picos de movimento da sua arena.', iconColor: 'var(--color-info)', iconBg: 'var(--color-info-bg)' },
  { icon: Calendar, title: 'Dias de maior movimento', desc: 'Planeje sua operação com base em dados reais.', iconColor: 'var(--color-primary)', iconBg: 'var(--color-primary-light)' },
  { icon: Users, title: 'Clientes recorrentes', desc: 'Identifique seus melhores clientes.', iconColor: 'var(--color-cyan)', iconBg: 'rgba(6,182,212,0.1)' },
  { icon: XCircle, title: 'Reservas canceladas', desc: 'Monitore cancelamentos e reduza perdas.', iconColor: 'var(--color-error)', iconBg: 'rgba(239,68,68,0.08)' },
];

const steps = [
  { num: 1, icon: MessageCircle, title: 'Converse com nossa equipe', desc: 'Entendemos como sua arena trabalha hoje e quais são suas necessidades.' },
  { num: 2, icon: Settings, title: 'Configuramos sua operação', desc: 'Cadastramos quadras, horários, preços, regras e estrutura inicial.' },
  { num: 3, icon: CheckCircle, title: 'Você aprova a configuração', desc: 'Validamos tudo junto com você antes de colocar a plataforma em operação.' },
  { num: 4, icon: Share2, title: 'Seus clientes começam a reservar', desc: 'Você recebe seu link personalizado e começa a centralizar as reservas no ArenaHub.' },
];

const experiences: { key: 'portal' | 'agenda' | 'admin'; label: string; desc: string }[] = [
  { key: 'portal', label: 'Portal do cliente', desc: 'O cliente escolhe data, quadra e horário e acompanha suas reservas.' },
  { key: 'agenda', label: 'Agenda da arena', desc: 'A equipe visualiza e administra toda a programação.' },
  { key: 'admin', label: 'Painel administrativo', desc: 'Gestão financeira, clientes, quadras, eventos e indicadores.' },
];

interface PricingPlan {
  name: string;
  price: string;
  priceAnnual: string;
  desc: string;
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
    priceAnnual: 'R$39',
    desc: 'Para arenas que estão começando a organizar suas reservas.',
    icon: Layers,
    popular: false,
    items: [
      '1 quadra',
      'Reservas avulsas',
      'Portal do cliente',
      'Calendário de disponibilidade',
      'Cadastro de clientes',
      'Histórico de reservas',
      'Relatórios básicos',
      '1 usuário administrativo',
      'Suporte por WhatsApp',
    ],
    btnLabel: 'Quero conhecer o ArenaHub',
    variant: 'secondary',
  },
  {
    name: 'Profissional',
    price: 'R$99',
    priceAnnual: 'R$79',
    desc: 'Para arenas que querem automatizar sua operação.',
    icon: Zap,
    popular: true,
    items: [
      'Até 5 quadras',
      'Tudo do Básico',
      'Reservas semanais e mensais',
      'Grupos fechados',
      'Lista de espera automática',
      'Eventos e torneios',
      'Controle de preços',
      'Bloqueio de clientes',
      'Funcionários e permissões',
      'Relatórios avançados',
      'Até 3 usuários administrativos',
      'Suporte prioritário',
    ],
    btnLabel: 'Quero conhecer o ArenaHub',
    variant: 'primary',
  },
  {
    name: 'Enterprise',
    price: 'A partir de R$199',
    priceAnnual: 'A partir de R$159',
    desc: 'Para arenas maiores e operações mais complexas.',
    icon: Building,
    popular: false,
    items: [
      'Até 10 quadras',
      'Tudo do Profissional',
      'Quadras adicionais disponíveis',
      'Google Calendar',
      'Relatórios financeiros completos',
      'Modo pré-pago',
      'Múltiplos administradores',
      'Permissões avançadas',
      'Multiunidade',
      'Relatórios por unidade',
      'Suporte dedicado',
    ],
    btnLabel: 'Falar com especialista',
    variant: 'secondary',
  },
];

const demoCards: IconCard[] = [
  { icon: LayoutDashboard, title: 'Painel administrativo', desc: 'Métricas, reservas do dia, aprovações pendentes e alertas em uma única visão.' },
  { icon: CalendarCheck, title: 'Fluxo de reserva', desc: 'O cliente seleciona a quadra, escolhe o horário disponível e confirma em segundos.' },
  { icon: BarChart2, title: 'Relatórios e indicadores', desc: 'Acompanhe receita, ocupação e performance da arena com dados em tempo real.' },
];

const securityCards: IconCard[] = [
  { icon: Shield, title: 'Controle de acesso', desc: 'Cada usuário acessa somente os recursos permitidos para seu perfil.' },
  { icon: Database, title: 'Proteção de dados', desc: 'Informações armazenadas seguindo boas práticas de segurança.' },
  { icon: FileText, title: 'Registro de atividades', desc: 'Ações administrativas importantes podem ser registradas para auditoria.' },
  { icon: Scale, title: 'LGPD', desc: 'Estrutura preparada para boas práticas de proteção e tratamento de dados.' },
];

const faqs = [
  { question: 'Como funciona o período de teste?', answer: 'Após a demonstração e configuração inicial, você terá 10 dias para testar o ArenaHub com acesso completo ao plano escolhido, sem precisar cadastrar cartão de crédito e sem compromisso.' },
  { question: 'O ArenaHub cobra alguma taxa por reserva?', answer: 'Não. O ArenaHub cobra apenas a mensalidade do plano contratado, sem taxas adicionais por reserva.' },
  { question: 'Posso definir diferentes preços por horário?', answer: 'Sim. Você pode configurar preços diferentes por quadra. Preços variáveis por horário fazem parte do roadmap da plataforma.' },
  { question: 'Posso bloquear uma quadra ou horário?', answer: 'Sim. É possível bloquear quadras e horários específicos diretamente pelo painel administrativo.' },
  { question: 'Posso cadastrar reservas recorrentes?', answer: 'Sim. O ArenaHub suporta reservas semanais e mensais para grupos fixos e mensalistas.' },
  { question: 'Posso ter funcionários com acessos diferentes?', answer: 'Sim. A partir do plano Profissional, você pode cadastrar funcionários com perfis de acesso específicos.' },
  { question: 'O que acontece quando uma reserva é cancelada?', answer: 'A reserva é marcada como cancelada no sistema e o horário volta a ficar disponível automaticamente.' },
  { question: 'Posso ter mais de uma unidade?', answer: 'Sim. O plano Enterprise suporta múltiplas unidades com gestão centralizada.' },
  { question: 'Meus clientes precisam criar uma conta para reservar?', answer: 'Sim, um cadastro simples com nome, email e telefone. O processo leva menos de um minuto.' },
  { question: 'Consigo migrar meus clientes atuais?', answer: 'Sim. Nossa equipe auxilia na importação da base de clientes durante a implantação.' },
  { question: 'O sistema funciona no celular?', answer: 'Sim. Tanto o painel administrativo quanto o portal do cliente funcionam em qualquer dispositivo.' },
  { question: 'Como funciona o pagamento dos clientes?', answer: 'O ArenaHub gerencia as reservas. A integração com gateway de pagamento está disponível nos planos Profissional e Enterprise.' },
  { question: 'Posso personalizar o portal com a identidade da minha arena?', answer: 'Sim. Nome, logo e cor principal são configuráveis. O portal fica disponível em arenahub.com/suaarena.' },
];

const footerCols = [
  { title: 'Produto', links: ['Funcionalidades', 'Preços', 'Demonstração', 'Segurança'] },
  { title: 'Empresa', links: ['Sobre', 'Cases', 'Contato'] },
  { title: 'Suporte', links: ['Central de ajuda', 'Documentação', 'Status'] },
  { title: 'Legal', links: ['LGPD', 'Termos de uso', 'Política de privacidade'] },
];

function scrollToId(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Landing() {
  const [experience, setExperience] = useState<'portal' | 'agenda' | 'admin'>('portal');
  const [annual, setAnnual] = useState(false);
  const activeExperience = experiences.find((e) => e.key === experience)!;

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex flex-col overflow-x-clip text-[var(--color-dark)]">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div
              className="animate-blob-1 absolute -left-20 top-10 h-[380px] w-[380px] rounded-full blur-3xl"
              style={{ backgroundColor: 'rgba(34,197,94,0.05)' }}
            />
            <div
              className="animate-blob-2 absolute right-0 top-40 h-[320px] w-[320px] rounded-full blur-3xl"
              style={{ backgroundColor: 'rgba(34,197,94,0.05)' }}
            />
            <div
              className="animate-blob-3 absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full blur-3xl"
              style={{ backgroundColor: 'rgba(6,182,212,0.05)' }}
            />
          </div>

          <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-16 px-6 py-20 md:flex-row md:px-20 md:py-[120px]">
            <div className="w-full md:w-[55%]">
              <m.div
                className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-gray-100)] px-3.5 py-1.5"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
              >
                <CircleCheck size={16} strokeWidth={1.5} color="var(--color-primary)" />
                <span className="text-[13px] font-medium text-[var(--color-dark)]">
                  Plataforma profissional para gestão de arenas esportivas
                </span>
              </m.div>

              <m.h1
                className="mb-6 flex flex-wrap text-[36px] leading-[1.25] tracking-[-1px] text-[var(--color-dark)] md:text-[52px] md:leading-[1.15]"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } } }}
              >
                {heroWords.map((w, i) => (
                  <m.span
                    key={i}
                    variants={fadeInUp}
                    className="mr-[0.35ch]"
                    style={{ color: w.accent ? 'var(--color-primary)' : undefined }}
                  >
                    {w.text}
                  </m.span>
                ))}
              </m.h1>

              <m.p
                className="mb-10 max-w-[520px] text-base leading-relaxed text-[var(--color-gray-600)] md:text-lg"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.75, ease: EASE_OUT }}
              >
                O ArenaHub centraliza reservas, clientes, quadras, horários e gestão financeira em uma única
                plataforma. Seus clientes reservam online e você administra tudo pelo painel.
              </m.p>

              <m.div
                className="mb-8 flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9, ease: EASE_OUT }}
              >
                <Button variant="primary" onClick={openWhatsApp}>
                  Quero conhecer o ArenaHub
                  <ArrowRight size={18} strokeWidth={1.5} />
                </Button>
                <Button variant="secondary" onClick={() => scrollToId('#funcionalidades')}>
                  Ver demonstração
                </Button>
              </m.div>

              <m.div
                className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-gray-400)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.05, ease: EASE_OUT }}
              >
                <span className="flex items-center gap-1.5">
                  <Check size={14} strokeWidth={1.5} />
                  Demonstração personalizada
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={14} strokeWidth={1.5} />
                  Implantação assistida
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={14} strokeWidth={1.5} />
                  Sem compromisso
                </span>
              </m.div>
            </div>

            <div className="relative w-full md:w-[45%]">
              <div
                className="absolute left-1/2 top-1/2 -z-10 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}
              />
              <m.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: EASE_OUT }}
              >
                <div className="animate-card-float flex flex-col gap-4 rounded-[var(--radius-xl)] bg-[var(--color-dark)] p-6 shadow-[var(--shadow-modal)]">
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
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[13px] text-[rgba(255,255,255,0.7)]">Hoje</span>
                      <span className="text-[13px] text-white">14 reservas</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[rgba(255,255,255,0.6)]">
                      {heroStatusBreakdown.map((b) => (
                        <span key={b.label} className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
                          {b.value} {b.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-4">
                    <div className="mb-3 text-[13px] text-[rgba(255,255,255,0.7)]">Ocupação por quadra</div>
                    {heroBars.map((b, i) => (
                      <div key={b.name} className="mb-2 flex items-center gap-2.5">
                        <span className="w-16 text-xs text-[rgba(255,255,255,0.5)]">{b.name}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-[4px] bg-[rgba(255,255,255,0.08)]">
                          <m.div
                            className="h-2 rounded-[4px]"
                            style={{ backgroundColor: b.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${b.pct}%` }}
                            transition={{ duration: 0.9, delay: 0.9 + i * 0.1, ease: EASE_OUT }}
                          />
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
              </m.div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF / PLATFORM STATS */}
        <section className="bg-[var(--color-gray-100)] py-20 md:py-[100px]">
          <div className="mx-auto max-w-[1280px] px-6 md:px-20">
            <Reveal>
              <h2 className="mb-12 text-center text-[28px] tracking-[-0.5px] text-[var(--color-dark)] md:text-[32px]">
                Uma plataforma feita para <span className="text-[var(--color-primary)]">arenas de todos os tamanhos</span>
              </h2>
            </Reveal>
            <Reveal stagger={0.1} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {platformStats.map((s) => (
                <RevealItem key={s.title}>
                  <div className="flex h-full flex-col items-center gap-3 rounded-[14px] border-[0.5px] border-[var(--color-gray-200)] bg-white p-6 text-center shadow-[var(--shadow-card)]">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--color-primary-light)' }}
                    >
                      <s.icon size={20} strokeWidth={1.5} color="var(--color-primary)" />
                    </div>
                    <div className="text-lg font-semibold text-[var(--color-dark)]">{s.title}</div>
                    <div className="text-sm text-[var(--color-gray-600)]">{s.caption}</div>
                  </div>
                </RevealItem>
              ))}
            </Reveal>
          </div>
        </section>

        {/* SPORT TYPES */}
        <section className="mx-auto max-w-[1280px] px-6 py-20 md:px-20 md:py-[100px]">
          <Reveal>
            <h2 className="mb-12 text-center text-[28px] tracking-[-0.5px] text-[var(--color-dark)] md:text-[32px]">
              Feito para diferentes <span className="text-[var(--color-primary)]">tipos de arenas esportivas</span>
            </h2>
          </Reveal>
          <Reveal stagger={0.1} className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {sportTypes.map((sport, i) => {
              const palette = [
                { color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
                { color: 'var(--color-cyan)', bg: 'rgba(6,182,212,0.1)' },
                { color: 'var(--color-info)', bg: 'var(--color-info-bg)' },
              ][i % 3];
              return (
                <RevealItem key={sport.label}>
                  <m.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                    className="flex h-full flex-col items-center gap-3 rounded-[14px] border-[0.5px] border-[var(--color-gray-200)] bg-white p-6 text-center shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-modal)]"
                  >
                    <m.div
                      initial="hidden"
                      whileInView="show"
                      viewport={viewportOnce}
                      variants={popIn}
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: palette.bg }}
                    >
                      <sport.icon size={22} strokeWidth={1.5} color={palette.color} />
                    </m.div>
                    <span className="text-[15px] font-medium text-[var(--color-dark)]">{sport.label}</span>
                  </m.div>
                </RevealItem>
              );
            })}
          </Reveal>
        </section>

        {/* PROBLEM */}
        <section className="bg-[var(--color-gray-100)] px-6 py-20 text-center md:px-20 md:py-[100px]">
          <div className="mx-auto max-w-[1280px]">
            <Reveal>
              <h2 className="mb-3 text-[28px] tracking-[-0.5px] text-[var(--color-dark)] md:text-[32px]">
                Sua arena ainda funciona no <span className="text-[var(--color-primary)]">improviso</span>?
              </h2>
              <p className="mx-auto mb-14 max-w-[600px] text-base text-[var(--color-gray-600)]">
                WhatsApp, planilha e anotações no papel custam caro — em tempo, em erros e em clientes perdidos.
              </p>
            </Reveal>
            <Reveal stagger={0.12} className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
              {problems.map((p) => (
                <RevealItem key={p.title}>
                  <div className="group relative h-full overflow-hidden rounded-[14px] border-[0.5px] border-[var(--color-gray-200)] bg-white p-7 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-modal)]">
                    <span className="absolute left-0 top-0 h-full w-[3px] origin-bottom scale-y-0 bg-[var(--color-primary)] transition-transform duration-300 group-hover:scale-y-100" />
                    <m.div
                      initial="hidden"
                      whileInView="show"
                      viewport={viewportOnce}
                      variants={popIn}
                      className="mb-4 inline-flex"
                    >
                      <p.icon size={24} strokeWidth={1.5} color="var(--color-gray-400)" />
                    </m.div>
                    <h3 className="mb-2 text-lg text-[var(--color-dark)]">{p.title}</h3>
                    <p className="text-[15px] leading-relaxed text-[var(--color-gray-600)]">{p.desc}</p>
                  </div>
                </RevealItem>
              ))}
            </Reveal>
            <Reveal className="mt-12 flex flex-col items-center gap-4">
              <p className="text-base font-medium text-[var(--color-dark)]">O ArenaHub resolve cada um desses problemas.</p>
              <Button variant="ghost" onClick={() => scrollToId('#como-funciona')}>
                Ver como funciona
              </Button>
            </Reveal>
          </div>
        </section>

        {/* FEATURES */}
        <section id="funcionalidades" className="py-20 md:py-[100px]">
          <div className="mx-auto max-w-[1280px] px-6 md:px-20">
            <Reveal>
              <h2 className="mb-12 text-center text-[28px] tracking-[-0.5px] text-[var(--color-dark)] md:text-[32px]">
                Tudo que sua arena precisa, <span className="text-[var(--color-primary)]">em um só lugar</span>
              </h2>
            </Reveal>
            <Reveal stagger={0.1} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <RevealItem key={f.title}>
                  <m.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                    className="group h-full rounded-[14px] border-t-2 border-t-transparent border-[0.5px] border-b-[var(--color-gray-200)] border-x-[var(--color-gray-200)] bg-white p-7 shadow-[var(--shadow-card)] transition-all duration-300 hover:border-t-[var(--color-primary)] hover:shadow-[var(--shadow-modal)]"
                  >
                    <m.div
                      className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: 'var(--color-primary-light)' }}
                    >
                      <f.icon size={22} strokeWidth={1.5} color="var(--color-primary)" />
                    </m.div>
                    <h3 className="mb-2 text-lg text-[var(--color-dark)]">{f.title}</h3>
                    <p className="text-[15px] leading-relaxed text-[var(--color-gray-600)]">{f.desc}</p>
                  </m.div>
                </RevealItem>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ANALYTICS */}
        <section id="analytics" className="bg-[var(--color-gray-100)] py-20 md:py-[100px]">
          <div className="mx-auto max-w-[1280px] px-6 md:px-20">
            <Reveal>
              <h2 className="mb-3 text-center text-[28px] tracking-[-0.5px] text-[var(--color-dark)] md:text-[32px]">
                Decida com <span className="text-[var(--color-primary)]">dados</span>, não com achismo
              </h2>
              <p className="mx-auto mb-12 max-w-[600px] text-center text-base text-[var(--color-gray-600)]">
                Acompanhe os indicadores que realmente importam para a operação da sua arena.
              </p>
            </Reveal>
            <Reveal stagger={0.1} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {analyticsCards.map((a) => (
                <RevealItem key={a.title}>
                  <m.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                    className="h-full rounded-[14px] border-[0.5px] border-[var(--color-gray-200)] bg-white p-7 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-modal)]"
                  >
                    <div
                      className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: a.iconBg }}
                    >
                      <a.icon size={22} strokeWidth={1.5} color={a.iconColor} />
                    </div>
                    <h3 className="mb-2 text-lg text-[var(--color-dark)]">{a.title}</h3>
                    <p className="text-[15px] leading-relaxed text-[var(--color-gray-600)]">{a.desc}</p>
                  </m.div>
                </RevealItem>
              ))}
            </Reveal>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="como-funciona" className="mx-auto max-w-[1280px] px-6 py-20 md:px-20 md:py-[100px]">
          <Reveal>
            <h2 className="mb-14 text-center text-[28px] tracking-[-0.5px] text-[var(--color-dark)] md:text-[32px]">
              Do primeiro contato à <span className="text-[var(--color-primary)]">sua arena funcionando</span>
            </h2>
          </Reveal>
          <div className="relative flex flex-col md:flex-row">
            <svg className="pointer-events-none absolute inset-x-0 top-5 hidden h-[2px] w-full md:block" preserveAspectRatio="none">
              <m.line
                x1="12.5%"
                y1="1"
                x2="87.5%"
                y2="1"
                stroke="var(--color-gray-200)"
                strokeWidth={2}
                strokeDasharray="6 6"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={viewportOnce}
                transition={{ duration: 1.2, ease: EASE_OUT }}
              />
            </svg>
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.15} className="relative z-10 flex-1 px-6 pb-10 md:pb-0">
                <div className="mb-4 text-[32px] font-semibold text-[var(--color-primary)]">
                  <CountUp value={s.num} format={(n) => String(n).padStart(2, '0')} duration={0.8} />
                </div>
                <s.icon size={24} strokeWidth={1.5} color="var(--color-dark)" className="mb-3" />
                <h3 className="mb-2 text-lg text-[var(--color-dark)]">{s.title}</h3>
                <p className="text-[15px] leading-relaxed text-[var(--color-gray-600)]">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* SCREENSHOT / TABS */}
        <section className="bg-[var(--color-dark)] py-20 md:py-[100px]">
          <div className="mx-auto max-w-[1280px] px-6 text-center md:px-20">
            <Reveal>
              <h2 className="mb-3 text-[28px] tracking-[-0.5px] text-white md:text-[32px]">
                Uma plataforma. <span className="text-[var(--color-primary)]">Três experiências.</span>
              </h2>
              <p className="mb-12 text-base text-[rgba(255,255,255,0.6)]">
                Do painel do administrador ao portal do cliente — tudo integrado.
              </p>
            </Reveal>
            <div className="relative mb-8 flex flex-wrap justify-center gap-3">
              {experiences.map((e) => {
                const active = experience === e.key;
                return (
                  <button
                    key={e.key}
                    onClick={() => setExperience(e.key)}
                    className="relative cursor-pointer rounded-[var(--radius-md)] border px-6 py-3 text-sm font-medium transition-colors duration-200"
                    style={{
                      borderColor: active ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)',
                      color: active ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {active && (
                      <m.span
                        layoutId="tab-active-bg"
                        className="absolute inset-0 -z-10 rounded-[var(--radius-md)]"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    {e.label}
                  </button>
                );
              })}
            </div>
            <div
              className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-8 md:h-[420px]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 12px)',
              }}
            >
              <AnimatePresence mode="wait">
                <m.p
                  key={experience}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="max-w-[420px] text-[15px] leading-relaxed text-[rgba(255,255,255,0.6)]"
                >
                  {activeExperience.desc}
                </m.p>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="precos" className="bg-[var(--color-gray-100)] py-20 md:py-[100px]">
          <div className="mx-auto max-w-[1280px] px-6 text-center md:px-20">
            <Reveal>
              <h2 className="mb-3 text-[28px] tracking-[-0.5px] text-[var(--color-dark)] md:text-[32px]">
                Planos simples, <span className="text-[var(--color-primary)]">sem surpresas</span>
              </h2>
              <p className="mb-8 text-base text-[var(--color-gray-600)]">
                Escale conforme sua arena cresce.
              </p>
              <div className="mb-14 flex items-center justify-center gap-3">
                <span className={`text-sm ${!annual ? 'font-medium text-[var(--color-dark)]' : 'text-[var(--color-gray-600)]'}`}>Mensal</span>
                <button
                  onClick={() => setAnnual((a) => !a)}
                  aria-label="Alternar cobrança mensal ou anual"
                  className="relative h-7 w-12 cursor-pointer rounded-full border-none p-0.5 transition-colors duration-200"
                  style={{ backgroundColor: annual ? 'var(--color-primary)' : 'var(--color-gray-200)' }}
                >
                  <m.span
                    className="block h-6 w-6 rounded-full bg-white shadow"
                    animate={{ x: annual ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  />
                </button>
                <span className={`text-sm ${annual ? 'font-medium text-[var(--color-dark)]' : 'text-[var(--color-gray-600)]'}`}>Anual</span>
              </div>
            </Reveal>

            <Reveal stagger={0.12} className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
              {pricing.map((plan) => (
                <RevealItem key={plan.name}>
                  <m.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                    className="relative h-full rounded-[14px] bg-white p-8"
                    style={{
                      border: plan.popular ? '2px solid var(--color-primary)' : '0.5px solid var(--color-gray-200)',
                      boxShadow: plan.popular ? '0 0 0 6px rgba(34,197,94,0.08)' : undefined,
                      transform: plan.popular ? 'scale(1.02)' : undefined,
                    }}
                  >
                    {plan.popular && (
                      <m.span
                        className="animate-pulse-soft absolute right-6 top-6 rounded-[var(--radius-full)] bg-[var(--color-success-bg)] px-3 py-1 text-xs font-medium text-[var(--color-success-text)]"
                      >
                        Mais popular
                      </m.span>
                    )}
                    <plan.icon size={24} strokeWidth={1.5} color="var(--color-primary)" className="mb-5" />
                    <h3 className="mb-1 text-lg text-[var(--color-dark)]">{plan.name}</h3>
                    <div className="mb-2 text-[32px] text-[var(--color-dark)]">
                      {annual ? plan.priceAnnual : plan.price}
                      <span className="text-[15px] text-[var(--color-gray-600)]">/mês</span>
                    </div>
                    <p className="mb-6 text-sm leading-relaxed text-[var(--color-gray-600)]">{plan.desc}</p>
                    <m.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
                      {plan.items.map((item) => (
                        <m.div key={item} variants={fadeInUp} className="mb-3 flex items-center gap-2">
                          <Check size={16} strokeWidth={1.5} color="var(--color-primary)" />
                          <span className="text-sm text-[var(--color-dark)]">{item}</span>
                        </m.div>
                      ))}
                    </m.div>
                    <Button variant={plan.variant} className="mt-3 w-full" onClick={openWhatsApp}>
                      {plan.btnLabel}
                    </Button>
                  </m.div>
                </RevealItem>
              ))}
            </Reveal>

            <div className="mx-auto mt-8 flex max-w-[560px] items-center justify-center gap-2 text-[13px] text-[var(--color-gray-600)]">
              <Check size={14} strokeWidth={1.5} color="var(--color-primary)" className="shrink-0" />
              <span>
                Após a demonstração e configuração inicial, você terá 10 dias para testar com acesso completo, sem
                cartão de crédito e sem compromisso.
              </span>
            </div>
          </div>
        </section>

        {/* PRODUCT DEMO */}
        <section
          id="cases"
          className="relative overflow-hidden py-20 md:py-[100px]"
          style={{
            backgroundImage: 'radial-gradient(rgba(15,23,42,0.04) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          <div className="mx-auto max-w-[1280px] px-6 text-center md:px-20">
            <Reveal>
              <h2 className="mb-3 text-[28px] tracking-[-0.5px] text-[var(--color-dark)] md:text-[32px]">
                Veja como o ArenaHub <span className="text-[var(--color-primary)]">funciona na prática</span>
              </h2>
              <p className="mx-auto mb-12 max-w-[600px] text-base text-[var(--color-gray-600)]">
                Explore as principais telas da plataforma antes de conversar com nossa equipe.
              </p>
            </Reveal>

            <Reveal stagger={0.12} className="grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
              {demoCards.map((d) => (
                <RevealItem key={d.title}>
                  <m.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                    className="h-full rounded-[14px] border-[0.5px] border-[var(--color-gray-200)] bg-white p-7 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-modal)]"
                  >
                    <div
                      className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--color-primary-light)' }}
                    >
                      <d.icon size={22} strokeWidth={1.5} color="var(--color-primary)" />
                    </div>
                    <h3 className="mb-2 text-lg text-[var(--color-dark)]">{d.title}</h3>
                    <p className="text-[15px] leading-relaxed text-[var(--color-gray-600)]">{d.desc}</p>
                  </m.div>
                </RevealItem>
              ))}
            </Reveal>

            <Reveal className="mt-12 flex flex-col items-center gap-4">
              <p className="max-w-[480px] text-base font-medium text-[var(--color-dark)]">
                Quer ver a plataforma funcionando ao vivo? Converse com nossa equipe e agende uma demonstração.
              </p>
              <Button variant="primary" onClick={openWhatsApp}>
                Agendar demonstração
              </Button>
            </Reveal>
          </div>
        </section>

        {/* SECURITY */}
        <section id="seguranca" className="bg-[var(--color-gray-100)] py-20 md:py-[100px]">
          <div className="mx-auto max-w-[1280px] px-6 md:px-20">
            <Reveal>
              <h2 className="mb-3 text-center text-[28px] tracking-[-0.5px] text-[var(--color-dark)] md:text-[32px]">
                Segurança em <span className="text-[var(--color-primary)]">primeiro lugar</span>
              </h2>
              <p className="mx-auto mb-12 max-w-[640px] text-center text-base text-[var(--color-gray-600)]">
                Seus dados e os dados dos seus clientes precisam estar protegidos. O ArenaHub foi projetado com
                controle de acesso, autenticação segura e proteção dos dados desde o início.
              </p>
            </Reveal>
            <Reveal stagger={0.1} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {securityCards.map((s) => (
                <RevealItem key={s.title}>
                  <m.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                    className="h-full rounded-[14px] border-[0.5px] border-[var(--color-gray-200)] bg-white p-7 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-modal)]"
                  >
                    <m.div
                      initial="hidden"
                      whileInView="show"
                      viewport={viewportOnce}
                      variants={popIn}
                      className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--color-primary-light)' }}
                    >
                      <s.icon size={22} strokeWidth={1.5} color="var(--color-primary)" />
                    </m.div>
                    <h3 className="mb-2 text-lg text-[var(--color-dark)]">{s.title}</h3>
                    <p className="text-[15px] leading-relaxed text-[var(--color-gray-600)]">{s.desc}</p>
                  </m.div>
                </RevealItem>
              ))}
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-[100px]">
          <div className="mx-auto max-w-[800px] px-6">
            <Reveal>
              <h2 className="mb-12 text-center text-[28px] tracking-[-0.5px] text-[var(--color-dark)] md:text-[32px]">
                Dúvidas <span className="text-[var(--color-primary)]">frequentes</span>
              </h2>
            </Reveal>
            <Reveal stagger={0.06}>
              <Accordion.Root type="single" collapsible defaultValue="0" className="flex flex-col gap-3">
                {faqs.map((q, i) => (
                  <RevealItem key={q.question}>
                    <Accordion.Item
                      value={String(i)}
                      className="overflow-hidden rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-gray-200)] bg-white"
                    >
                      <Accordion.Header>
                        <Accordion.Trigger className="group flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-5 py-[18px] text-left transition-colors duration-200 hover:bg-[var(--color-gray-50)]">
                          <span className="text-[15px] font-medium text-[var(--color-dark)]">{q.question}</span>
                          <ChevronDown
                            size={18}
                            strokeWidth={1.5}
                            color="var(--color-gray-600)"
                            className="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                          />
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Content className="accordion-content">
                        <div className="px-5 pb-[18px] text-sm leading-relaxed text-[var(--color-gray-600)]">{q.answer}</div>
                      </Accordion.Content>
                    </Accordion.Item>
                  </RevealItem>
                ))}
              </Accordion.Root>
            </Reveal>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="relative overflow-hidden bg-[var(--color-dark)] py-20 text-center md:py-[100px]">
          <div
            className="animate-gradient-pan pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                'linear-gradient(120deg, rgba(34,197,94,0.12), rgba(6,182,212,0.08), rgba(34,197,94,0.12))',
            }}
          />
          <Reveal className="px-6">
            <h2 className="mb-3 text-[28px] tracking-[-0.5px] text-white md:text-[40px]">
              Pare de administrar sua arena <span className="text-[var(--color-primary)]">pelo improviso.</span>
            </h2>
            <p className="mb-8 text-base text-[rgba(255,255,255,0.6)]">
              Centralize reservas, clientes, quadras e gestão em uma única plataforma.
            </p>
            <div className="relative inline-block">
              <span className="animate-ping-ring absolute inset-0 rounded-[var(--radius-md)] border-2 border-[var(--color-primary)]" />
              <Button variant="primary" className="relative px-8 py-3.5 text-base" onClick={openWhatsApp}>
                Quero conhecer o ArenaHub
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-5 text-xs text-[rgba(255,255,255,0.4)]">
              <span className="flex items-center gap-1.5">
                <Check size={14} strokeWidth={1.5} />
                Demonstração personalizada
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} strokeWidth={1.5} />
                Implantação assistida
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} strokeWidth={1.5} />
                Sem compromisso
              </span>
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[var(--color-dark)] px-6 py-16 md:px-20">
          <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-10">
            <div className="w-full md:w-[280px]">
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
              <div key={col.title} className="w-[45%] sm:w-[160px]">
                <div className="mb-4 text-[13px] font-medium text-white">{col.title}</div>
                {col.links.map((link) => (
                  <div key={link} className="mb-3">
                    <a href="#" className="group relative inline-block text-[13px] text-[rgba(255,255,255,0.5)] no-underline">
                      {link}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[var(--color-primary)] transition-all duration-300 group-hover:w-full" />
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mx-auto mt-12 flex max-w-[1280px] flex-col items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.08)] pt-6 sm:flex-row">
            <span className="text-xs text-[rgba(255,255,255,0.4)]">© 2026 ArenaHub. Todos os direitos reservados.</span>
            <div className="flex gap-4">
              <m.a href="#" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} aria-label="Contato">
                <AtSign size={18} strokeWidth={1.5} color="rgba(255,255,255,0.4)" />
              </m.a>
              <m.a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} aria-label="WhatsApp">
                <LinkIcon size={18} strokeWidth={1.5} color="rgba(255,255,255,0.4)" />
              </m.a>
            </div>
          </div>
        </footer>
      </div>
    </LazyMotion>
  );
}
