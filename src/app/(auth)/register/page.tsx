'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell } from '@/components/auth/AuthShell';
import { Eye, EyeOff, User, Mail, Lock, Building2, Briefcase, ShieldCheck } from 'lucide-react';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  department: string;
  position: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    department: '',
    position: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Le nom complet est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) return;

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        department: formData.department || undefined,
        position: formData.position || undefined,
      });
      router.push('/chat');
      router.refresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Échec de l'inscription");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const passwordTouched = formData.password.length > 0;
  const passwordValid = formData.password.length >= 8;

  return (
    <AuthShell
      subtitle="Créer un compte"
      aside={
        <ul className="mt-10 space-y-4 text-sm text-primary-100">
          <li className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-200" />
            <span>Onboarding guidé, étape par étape.</span>
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-200" />
            <span>Accès à toute la base documentaire RH.</span>
          </li>
        </ul>
      }
      footer={
        <>
          Déjà inscrit ?{' '}
          <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Se connecter
          </Link>
        </>
      }
    >
      <div className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-soft sm:p-8">
        {formError && (
          <div
            className="mb-5 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700"
            role="alert"
          >
            {formError}
          </div>
        )}

        <form id="register-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            name="fullName"
            type="text"
            label="Nom complet"
            leftIcon={<User className="h-5 w-5" />}
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="Jean Dupont"
            autoComplete="name"
            required
            disabled={isLoading}
          />

          <Input
            name="email"
            type="email"
            label="Email professionnel"
            leftIcon={<Mail className="h-5 w-5" />}
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="jean.dupont@entreprise.com"
            autoComplete="email"
            required
            disabled={isLoading}
          />

          <Input
            name="department"
            type="text"
            label="Département (optionnel)"
            leftIcon={<Building2 className="h-5 w-5" />}
            value={formData.department}
            onChange={handleChange}
            placeholder="Ressources Humaines, IT, Marketing…"
            autoComplete="organization"
            disabled={isLoading}
          />

          <Input
            name="position"
            type="text"
            label="Poste (optionnel)"
            leftIcon={<Briefcase className="h-5 w-5" />}
            value={formData.position}
            onChange={handleChange}
            placeholder="Développeur, RH, Chef de projet…"
            autoComplete="organization-title"
            disabled={isLoading}
          />

          <div>
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Mot de passe"
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
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              disabled={isLoading}
            />
            {passwordTouched && !errors.password && (
              <p className="mt-1.5 text-sm text-secondary-500">
                {passwordValid
                  ? 'Mot de passe valide.'
                  : 'Au moins 8 caractères recommandés.'}
              </p>
            )}
          </div>

          <Input
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            label="Confirmer le mot de passe"
            leftIcon={<Lock className="h-5 w-5" />}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            disabled={isLoading}
          />

          <Button type="submit" form="register-form" className="w-full" size="lg" isLoading={isLoading}>
            Créer mon compte
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
