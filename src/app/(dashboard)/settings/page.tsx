'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Loader2, Settings, KeyRound, Globe, LogOut, Check, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser, logout, isLoading: authLoading } = useAuthStore();
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [savingPw, setSavingPw] = useState(false);
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [locale, setLocale] = useState(user?.locale ?? 'fr');
  const [savingLocale, setSavingLocale] = useState(false);
  const [localeStatus, setLocaleStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePwSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus(null);
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPwStatus({ type: 'error', message: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPwStatus({ type: 'error', message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
      return;
    }
    setSavingPw(true);
    try {
      await api.post('/auth/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setPwStatus({ type: 'success', message: 'Mot de passe changé avec succès.' });
    } catch {
      setPwStatus({ type: 'error', message: 'Mot de passe actuel incorrect ou erreur serveur.' });
    } finally {
      setSavingPw(false);
    }
  };

  const handleLocaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocaleStatus(null);
    setSavingLocale(true);
    try {
      const { data } = await api.put('/auth/me', { locale });
      updateUser(data);
      setLocaleStatus({ type: 'success', message: 'Préférences enregistrées.' });
    } catch {
      setLocaleStatus({ type: 'error', message: 'Une erreur est survenue.' });
    } finally {
      setSavingLocale(false);
    }
  };

  const StatusBanner = ({ status }: { status: { type: 'success' | 'error'; message: string } }) => (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
        status.type === 'success' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
      }`}
    >
      {status.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {status.message}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary-600" />
          Paramètres
        </h1>
        <p className="text-secondary-500 mt-1">Gérez la sécurité et les préférences de votre compte.</p>
      </div>

      <div className="space-y-6">
        {/* Sécurité */}
        <section className="bg-white rounded-2xl border border-secondary-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary-900 flex items-center gap-2 mb-4">
            <KeyRound className="w-5 h-5 text-primary-600" />
            Sécurité
          </h2>
          {pwStatus && <div className="mb-4"><StatusBanner status={pwStatus} /></div>}
          <form onSubmit={handlePwSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">Mot de passe actuel</label>
              <input
                type="password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePwChange}
                className="w-full px-3 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Nouveau mot de passe</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePwChange}
                  className="w-full px-3 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Confirmer le mot de passe</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={handlePwChange}
                  className="w-full px-3 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" isLoading={savingPw} variant="secondary">
                {savingPw ? 'Modification...' : 'Changer le mot de passe'}
              </Button>
            </div>
          </form>
        </section>

        {/* Préférences */}
        <section className="bg-white rounded-2xl border border-secondary-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary-900 flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary-600" />
            Préférences
          </h2>
          {localeStatus && <div className="mb-4"><StatusBanner status={localeStatus} /></div>}
          <form onSubmit={handleLocaleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">Langue de l'interface</label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full px-3 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="flex justify-end">
              <Button type="submit" isLoading={savingLocale}>
                {savingLocale ? 'Enregistrement...' : 'Enregistrer les préférences'}
              </Button>
            </div>
          </form>
        </section>

        {/* Session */}
        <section className="bg-white rounded-2xl border border-secondary-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Session</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-700">Déconnexion</p>
              <p className="text-xs text-secondary-500 mt-0.5">Vous serez redirigé vers la page de connexion.</p>
            </div>
            <Button variant="destructive" leftIcon={<LogOut className="w-4 h-4" />} onClick={logout}>
              Se déconnecter
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
