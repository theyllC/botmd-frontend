import Link from 'next/link';
import { Bot } from 'lucide-react';
import { ReactNode } from 'react';

interface AuthShellProps {
  children: ReactNode;
  subtitle: string;
  footer: ReactNode;
  aside?: ReactNode;
}

export function AuthShell({ children, subtitle, footer, aside }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-secondary-100 lg:grid lg:grid-cols-2">
      {/* Branded panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-primary-700 px-12 py-16 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Bot className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight">BoTMD</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Votre assistant d&apos;onboarding, enfin simple.
          </h2>
          <p className="mt-4 text-base text-primary-100">
            BoTMD centralise vos documents RH et guide vos collaborateurs, jour après jour.
          </p>
          {aside}
        </div>

        <p className="relative text-sm text-primary-200">
          © {new Date().getFullYear()} BoTMD. Tous droits réservés.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900">BoTMD</span>
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-secondary-900">{subtitle}</h1>
          </div>

          {children}

          <div className="mt-6 text-center text-sm text-secondary-500">{footer}</div>

          <p className="mt-8 text-center text-xs text-secondary-400">
            En continuant, vous acceptez nos{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">
              Conditions
            </Link>{' '}
            et notre{' '}
            <Link href="/privacy" className="text-primary-600 hover:underline">
              Politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
