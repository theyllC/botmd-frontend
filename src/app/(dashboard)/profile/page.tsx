'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
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
        const original = (user as unknown as Record<string, unknown>)[key];
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
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight text-secondary-900 flex items-center gap-2.5">
          <User className="w-7 h-7 text-primary-500" />
          Mon profil
        </h1>
        <p className="text-secondary-500 mt-1.5 text-[15px]">Gérez vos informations personnelles.</p>
      </div>

      <Card variant="glass" className="overflow-hidden mb-6">
        <div className="flex items-center gap-5 p-6 sm:p-8 bg-gradient-to-br from-primary-50/60 to-white">
          <Avatar src={user.avatar_url} fallback={user.full_name} size="xl" />
          <div className="min-w-0">
            <p className="text-xl font-semibold text-secondary-900 truncate">{user.full_name}</p>
            <p className="text-sm text-secondary-500 truncate flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </p>
            <Badge variant="primary" className="mt-3 gap-1">
              <Shield className="w-3 h-3" />
              {ROLE_LABELS[user.role] ?? user.role}
            </Badge>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Ces informations sont visibles par les administrateurs de votre organisation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {status && (
              <div
                role="status"
                className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                  status.type === 'success' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
                }`}
              >
                {status.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {status.message}
              </div>
            )}

            <Input label="Nom complet" name="full_name" value={form.full_name} onChange={handleChange} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Département"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Ex. Ressources Humaines"
                leftIcon={<Building className="w-4 h-4" />}
              />
              <Input
                label="Poste"
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="Ex. Analyste"
                leftIcon={<Briefcase className="w-4 h-4" />}
              />
            </div>

            <div>
              <Label htmlFor="locale">Langue</Label>
              <select
                id="locale"
                name="locale"
                value={form.locale}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-2.5 text-[15px] text-secondary-900 transition-all duration-200 ease-out focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
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
        </CardContent>
      </Card>
    </div>
  );
}
