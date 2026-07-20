'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell } from '@/components/auth/AuthShell';
import { Mail, Lock, Eye, EyeOff, Chrome, Github, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/chat');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Échec de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'microsoft') => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/oauth/${provider}`;
  };

  const isBusy = isLoading || authLoading;

  return (
    <AuthShell
      subtitle="Connexion"
      aside={
        <ul className="mt-10 space-y-4 text-sm text-primary-100">
          <li className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-200" />
            <span>Données chiffrées et conformes RGPD.</span>
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-200" />
            <span>Accès personnalisé selon votre rôle.</span>
          </li>
        </ul>
      }
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-medium text-primary-600 hover:text-primary-700">
            Créez-en un
          </Link>
        </>
      }
    >
      <div className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-soft sm:p-8">
        {error && (
          <div
            className="mb-5 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            leftIcon={<Mail className="h-5 w-5" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            autoComplete="email"
            required
            disabled={isBusy}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                Mot de passe
              </label>
              <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                Oublié ?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              leftIcon={<Lock className="h-5 w-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-secondary-400 transition-colors hover:text-secondary-600"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={isBusy}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isBusy}>
            Se connecter
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-secondary-200" />
          <span className="text-xs font-medium uppercase tracking-wider text-secondary-400">
            ou
          </span>
          <span className="h-px flex-1 bg-secondary-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleOAuthLogin('google')}
            disabled={isBusy}
            className="gap-2"
            aria-label="Se connecter avec Google"
          >
            <Chrome className="h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthLogin('microsoft')}
            disabled={isBusy}
            className="gap-2"
            aria-label="Se connecter avec Microsoft"
          >
            <Github className="h-4 w-4" />
            Microsoft
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
