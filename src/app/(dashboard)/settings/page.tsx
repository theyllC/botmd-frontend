'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Loader2, Settings, KeyRound, Globe, Bell, LogOut, Check, AlertCircle } from 'lucide-react';

type StatusState = { type: 'success' | 'error'; message: string };

function StatusBanner({ status }: { status: StatusState }) {
  return (
    <div
      role="status"
      className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
        status.type === 'success' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
      }`}
    >
      {status.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      {status.message}
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser, logout, isLoading: authLoading } = useAuthStore();
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [savingPw, setSavingPw] = useState(false);
  const [pwStatus, setPwStatus] = useState<StatusState | null>(null);

  const [locale, setLocale] = useState(user?.locale ?? 'fr');
  const [savingLocale, setSavingLocale] = useState(false);
  const [localeStatus, setLocaleStatus] = useState<StatusState | null>(null);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight text-secondary-900 flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-primary-500" />
          Paramètres
        </h1>
        <p className="text-secondary-500 mt-1.5 text-[15px]">Gérez la sécurité et les préférences de votre compte.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary-500" />
              Sécurité
            </CardTitle>
            <CardDescription>Modifiez votre mot de passe régulièrement pour sécuriser votre compte.</CardDescription>
          </CardHeader>
          <CardContent>
            {pwStatus && (
              <div className="mb-4">
                <StatusBanner status={pwStatus} />
              </div>
            )}
            <form onSubmit={handlePwSubmit} className="space-y-4">
              <Input
                label="Mot de passe actuel"
                type="password"
                name="current_password"
                autoComplete="current-password"
                value={passwordForm.current_password}
                onChange={handlePwChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  name="new_password"
                  autoComplete="new-password"
                  value={passwordForm.new_password}
                  onChange={handlePwChange}
                  helperText="8 caractères minimum"
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  name="confirm_password"
                  autoComplete="new-password"
                  value={passwordForm.confirm_password}
                  onChange={handlePwChange}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" isLoading={savingPw} variant="secondary">
                  {savingPw ? 'Modification...' : 'Changer le mot de passe'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary-500" />
              Préférences
            </CardTitle>
            <CardDescription>Personnalisez votre expérience sur la plateforme.</CardDescription>
          </CardHeader>
          <CardContent>
            {localeStatus && (
              <div className="mb-4">
                <StatusBanner status={localeStatus} />
              </div>
            )}
            <form onSubmit={handleLocaleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="locale-select">Langue de l&apos;interface</Label>
                <select
                  id="locale-select"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-2.5 text-[15px] text-secondary-900 transition-all duration-200 ease-out focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-500" />
              Notifications
            </CardTitle>
            <CardDescription>Choisissez les notifications que vous souhaitez recevoir.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-1">
              <div className="pr-4">
                <Label htmlFor="email-notifs" className="text-secondary-900">
                  Notifications par e-mail
                </Label>
                <p className="text-xs text-secondary-500 mt-0.5">Recevez un résumé de vos conversations importantes.</p>
              </div>
              <Switch id="email-notifs" checked={emailNotifs} onCheckedChange={setEmailNotifs} aria-label="Notifications par e-mail" />
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="pr-4">
                <Label htmlFor="product-updates" className="text-secondary-900">
                  Nouveautés produit
                </Label>
                <p className="text-xs text-secondary-500 mt-0.5">Soyez informé des nouvelles fonctionnalités de BoTMD.</p>
              </div>
              <Switch id="product-updates" checked={productUpdates} onCheckedChange={setProductUpdates} aria-label="Nouveautés produit" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-700">Déconnexion</p>
                <p className="text-xs text-secondary-500 mt-0.5">Vous serez redirigé vers la page de connexion.</p>
              </div>
              <Button variant="destructive" leftIcon={<LogOut className="w-4 h-4" />} onClick={logout}>
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
