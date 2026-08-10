import { useState } from 'react';
import { Image } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { cn } from '../lib/cn';
import { useAdminHeader } from '../layouts/AdminHeaderContext';

const tabs = ['Dados da arena', 'Plano', 'Equipe e permissões', 'Notificações'];

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] text-[var(--color-dark)]">{label}</label>
      <Input defaultValue={defaultValue} />
    </div>
  );
}

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  useAdminHeader({ title: 'Configurações' });

  return (
    <div className="flex flex-col">
      <div className="-mx-8 -mt-8 flex gap-7 border-b border-[var(--color-gray-200)] bg-white px-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'cursor-pointer border-none border-b-2 bg-transparent pb-3 pt-4 text-sm',
              activeTab === tab
                ? 'border-[var(--color-primary)] font-medium text-[var(--color-dark)]'
                : 'border-transparent text-[var(--color-gray-600)]',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-[720px] pt-8">
        {activeTab === 'Dados da arena' ? (
          <Card>
            <div className="mb-5 text-[15px] text-[var(--color-dark)]">Dados da arena</div>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] border-[0.5px] border-dashed border-[#CBD5E1] bg-[var(--color-gray-100)]">
                <Image size={22} strokeWidth={1.5} color="var(--color-gray-400)" />
              </div>
              <div>
                <Button variant="secondary" className="px-3.5 py-2 text-[13px]">
                  Carregar logo
                </Button>
                <div className="mt-1.5 text-xs text-[var(--color-gray-400)]">PNG ou JPG, até 2MB</div>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <Field label="Nome da arena" defaultValue="Arena Rossato" />
              <Field label="CNPJ" defaultValue="12.345.678/0001-90" />
            </div>
            <div className="mb-4">
              <Field label="Telefone" defaultValue="(16) 99123-4567" />
            </div>
            <div className="mb-4">
              <Field label="Endereço" defaultValue="Av. das Palmeiras, 450" />
            </div>
            <div className="mb-4 grid grid-cols-3 gap-4">
              <Field label="Cidade" defaultValue="Ribeirão Preto" />
              <Field label="Estado" defaultValue="SP" />
              <Field label="CEP" defaultValue="14025-000" />
            </div>
            <div className="mb-6 grid grid-cols-2 gap-4">
              <Field label="Abertura" defaultValue="07:00" />
              <Field label="Fechamento" defaultValue="23:00" />
            </div>

            <div className="flex justify-end gap-3 border-t border-[var(--color-gray-100)] pt-5">
              <Button variant="secondary">Cancelar</Button>
              <Button variant="primary">Salvar alterações</Button>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-gray-200)] bg-white py-16 text-[var(--color-gray-400)]">
            <span className="text-sm">Em construção</span>
          </div>
        )}
      </div>
    </div>
  );
}
