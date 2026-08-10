import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '../components/Button';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <ShieldAlert size={40} strokeWidth={1.5} color="var(--color-error)" />
      <h1 className="text-[22px] text-[var(--color-dark)]">Acesso não autorizado</h1>
      <p className="max-w-sm text-sm text-[var(--color-gray-600)]">
        Você não tem permissão para acessar esta página.
      </p>
      <Link to="/login">
        <Button variant="primary">Voltar para o login</Button>
      </Link>
    </div>
  );
}
