import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Triangle } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: signInError } = await signIn(email, password);

    setSubmitting(false);

    if (signInError) {
      setError('Email ou senha inválidos.');
      return;
    }

    navigate('/app', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-gray-50)] px-6">
      <Card className="w-full max-w-[380px] p-8">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Triangle size={28} strokeWidth={1.5} color="var(--color-primary)" />
          <span className="text-lg text-[var(--color-dark)]">
            Arena<span className="font-medium text-[var(--color-primary)]">Hub</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[13px] text-[var(--color-dark)]">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" variant="primary" className="mt-2 w-full" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>

          {error && <span className="text-[12px] text-[var(--color-error)]">{error}</span>}
        </form>
      </Card>
    </div>
  );
}
