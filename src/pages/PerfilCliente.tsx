import { useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

interface NotifPref {
  label: string;
  desc: string;
  on: boolean;
}

const initialPrefs: NotifPref[] = [
  { label: 'Confirmação de reserva por email', desc: 'Receba um email quando sua reserva for confirmada', on: true },
  { label: 'Lembrete por WhatsApp', desc: 'Lembrete 2 horas antes do horário reservado', on: true },
  { label: 'Novidades e promoções', desc: 'Ofertas e novidades da Arena Rossato', on: false },
];

const summary = [
  { label: 'Total de reservas', value: '24' },
  { label: 'Quadra favorita', value: 'Quadra 2' },
  { label: 'Total investido', value: 'R$1.680' },
  { label: 'Última reserva', value: '07/08/2026' },
];

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] text-[var(--color-dark)]">{label}</label>
      <Input defaultValue={defaultValue} />
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="relative h-5 w-9 shrink-0 cursor-pointer rounded-[var(--radius-full)] border-none transition-colors"
      style={{ backgroundColor: on ? 'var(--color-primary)' : '#CBD5E1' }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
        style={{ left: on ? '18px' : '2px' }}
      />
    </button>
  );
}

export default function PerfilCliente() {
  const [prefs, setPrefs] = useState(initialPrefs);

  const togglePref = (index: number) => {
    setPrefs((prev) => prev.map((p, i) => (i === index ? { ...p, on: !p.on } : p)));
  };

  return (
    <div className="-mx-12 flex gap-6 bg-[var(--color-gray-100)] px-12 pb-16 pt-10">
      <div className="flex w-[64%] flex-col gap-5">
        <Card>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[22px] font-medium text-[var(--color-success-text)]">
              MS
            </div>
            <div>
              <div className="text-lg text-[var(--color-dark)]">Maria Silva</div>
              <div className="text-[13px] text-[var(--color-gray-600)]">Cliente desde março de 2024</div>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <Field label="Nome completo" defaultValue="Maria Silva" />
            <Field label="Telefone" defaultValue="(16) 99123-1111" />
          </div>
          <div className="mb-6">
            <Field label="Email" defaultValue="maria.silva@email.com" />
          </div>

          <div className="flex justify-end gap-3 border-t border-[var(--color-gray-100)] pt-5">
            <Button variant="secondary">Cancelar</Button>
            <Button variant="primary">Salvar alterações</Button>
          </div>
        </Card>

        <Card>
          <div className="mb-4 text-[15px] text-[var(--color-dark)]">Preferências de notificação</div>
          <div className="flex flex-col">
            {prefs.map((pref, i) => (
              <div
                key={pref.label}
                className={`flex items-center justify-between py-3 ${i > 0 ? 'border-t border-[var(--color-gray-100)]' : ''}`}
              >
                <div>
                  <div className="text-sm text-[var(--color-dark)]">{pref.label}</div>
                  <div className="mt-0.5 text-xs text-[var(--color-gray-400)]">{pref.desc}</div>
                </div>
                <Toggle on={pref.on} onToggle={() => togglePref(i)} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="w-[36%]">
        <Card>
          <div className="mb-4 text-[15px] text-[var(--color-dark)]">Resumo de reservas</div>
          <div className="flex flex-col gap-4">
            {summary.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-[13px] text-[var(--color-gray-600)]">{item.label}</span>
                <span className="text-sm text-[var(--color-dark)]">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
