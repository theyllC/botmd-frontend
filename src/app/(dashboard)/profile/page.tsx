'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Loader2, User, Shield, Mail, Building, Briefcase, Check, AlertCircle } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  employee: 'Employé',
  admin: 'Administrateur',
  super_admin: 'Super administrateur',
};

export default function ProfilePage() {
  const { user, updateUser, isLoading: authLoading } = useAuthStore();
  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    department: user?.department ?? '',
    position: user?.position ?? '',
    locale: user?.locale ?? 'fr',
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const payload: Record<string, unknown> = {};
      (Object.keys(form) as Array<keyof typeof form>).forEach((key) => {
        const value = form[key];
        const original = (user as Record<string, unknown>)[key];
        if (value !== (original ?? '')) {
          payload[key] = value;
        }
      });

      const { data } = await api.put('/auth/me', payload);
      updateUser(data);
      setStatus({ type: 'success', message: 'Profil mis à jour avec succès.' });
    } catch {
      setStatus({ type: 'error', message: 'Une erreur est survenue lors de la mise à jour.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
          <User className="w-6 h-6 text-primary-600" />
          Mon profil
        </h1>
        <p className="text-secondary-500 mt-1">Gérez vos informations personnelles.</p>
      </div>

      <div className="bg-white rounded-2xl border border-secondary-200 shadow-sm overflow-hidden">
        {/* En-tête du profil */}
        <div className="flex items-center gap-4 p-6 bg-secondary-50 border-b border-secondary-200">
          <Avatar src={user.avatar_url} fallback={user.full_name} size="xl" />
          <div className="min-w-0">
            <p className="text-lg font-semibold text-secondary-900 truncate">{user.full_name}</p>
            <p className="text-sm text-secondary-500 truncate flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
            <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
              <Shield className="w-3.5 h-3.5" />
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {status && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                status.type === 'success'
                  ? 'bg-success-50 text-success-700'
                  : 'bg-error-50 text-error-700'
              }`}
            >
              {status.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {status.message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Nom complet</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-secondary-400" />
                Département
              </label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Ex. Ressources Humaines"
                className="w-full px-3 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-secondary-400" />
                Poste
              </label>
              <input
                type="text"
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="Ex. Analyste"
                className="w-full px-3 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Langue</label>
            <select
              name="locale"
              value={form.locale}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
