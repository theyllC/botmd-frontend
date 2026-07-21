'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { adminApi, type AdminUsersParams } from '@/lib/admin';
import { ROLE_LABELS, type UserListItem, type UserCreateAdmin, type LoginHistoryItem } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import { Modal } from '@/components/ui/Modal';
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  Search,
  Trash2,
  RefreshCw,
  FileText,
  Pencil,
  Plus,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const EMPTY_FORM: UserCreateAdmin & { id?: string } = {
  email: '',
  full_name: '',
  password: '',
  department: '',
  position: '',
  role: 'employee',
  is_active: true,
};

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Create / edit modal
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<UserCreateAdmin & { id?: string }>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Login history modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyUser, setHistoryUser] = useState<UserListItem | null>(null);
  const [historyItems, setHistoryItems] = useState<LoginHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const PAGE_SIZE = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: AdminUsersParams = { page, page_size: PAGE_SIZE };
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (departmentFilter.trim()) params.department = departmentFilter.trim();
      if (activeFilter === 'active') params.is_active = true;
      if (activeFilter === 'inactive') params.is_active = false;
      const res = await adminApi.getUsers(params);
      setUsers(res.items);
      setTotal(res.total);
    } catch {
      toast.error('Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, activeFilter, departmentFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.replace('/chat');
      return;
    }
    load();
  }, [user, router, load]);

  const handleToggleActive = async (u: UserListItem) => {
    try {
      if (u.is_active) {
        await adminApi.deactivateUser(u.id);
        toast.success(`${u.full_name} désactivé`);
      } else {
        await adminApi.activateUser(u.id);
        toast.success(`${u.full_name} activé`);
      }
      load();
    } catch {
      toast.error('Action impossible');
    }
  };

  const handleDelete = async (u: UserListItem) => {
    if (!confirm(`Supprimer définitivement ${u.full_name} ?`)) return;
    try {
      await adminApi.deleteUser(u.id);
      toast.success(`${u.full_name} supprimé`);
      load();
    } catch {
      toast.error('Suppression impossible');
    }
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormMode('create');
    setFormOpen(true);
  };

  const openEdit = (u: UserListItem) => {
    setForm({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      password: '',
      department: u.department || '',
      position: u.position || '',
      role: u.role,
      is_active: u.is_active,
    });
    setFormMode('edit');
    setFormOpen(true);
  };

  const submitForm = async () => {
    if (!form.full_name.trim() || (formMode === 'create' && (!form.email.trim() || !form.password.trim()))) {
      toast.error('Merci de remplir les champs obligatoires');
      return;
    }
    setSaving(true);
    try {
      if (formMode === 'create') {
        await adminApi.createUser({
          email: form.email.trim(),
          full_name: form.full_name.trim(),
          password: form.password,
          department: form.department || null,
          position: form.position || null,
          role: form.role,
          is_active: form.is_active,
        });
        toast.success('Utilisateur créé');
      } else if (form.id) {
        await adminApi.updateUser(form.id, {
          full_name: form.full_name.trim(),
          department: form.department || null,
          position: form.position || null,
          role: form.role,
          is_active: form.is_active,
        });
        toast.success('Utilisateur mis à jour');
      }
      setFormOpen(false);
      load();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Échec de l'enregistrement";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (u: UserListItem) => {
    setHistoryUser(u);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const res = await adminApi.getUserLoginHistory(u.id, { page_size: 20 });
      setHistoryItems(res.items);
    } catch {
      toast.error("Impossible de charger l'historique de connexion");
    } finally {
      setHistoryLoading(false);
    }
  };

  if (user && user.role !== 'admin' && user.role !== 'super_admin') return null;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-secondary-900">Administration</h1>
          <p className="text-xs text-secondary-500">Gestion des utilisateurs · {total} au total</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/documents">
            <Button variant="outline" leftIcon={<FileText className="w-3.5 h-3.5" />}>
              Documents RAG
            </Button>
          </Link>
          <Button leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openCreate}>
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-3 flex flex-wrap gap-2 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Rechercher (nom, email...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5" />}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="input w-auto h-8"
          >
            <option value="">Tous rôles</option>
            <option value="employee">Employé</option>
            <option value="admin">Administrateur</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
            className="input w-auto h-8"
          >
            <option value="">Tous statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
          <Input
            placeholder="Département"
            value={departmentFilter}
            onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
            className="w-36"
          />
          <Button variant="ghost" size="icon" onClick={load} aria-label="Rafraîchir">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="p-8 text-center text-sm text-secondary-500">Aucun utilisateur trouvé.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-dense">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Rôle</th>
                    <th>Département</th>
                    <th>Statut</th>
                    <th>Dernière connexion</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar src={null} fallback={u.full_name} size="sm" />
                          <div className="min-w-0">
                            <p className="font-medium text-secondary-900 truncate leading-tight">{u.full_name}</p>
                            <p className="text-[11px] text-secondary-500 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant="outline">{ROLE_LABELS[u.role] || u.role}</Badge>
                      </td>
                      <td className="text-secondary-600">
                        {u.department || '—'}
                        {u.position ? <span className="text-secondary-400"> · {u.position}</span> : ''}
                      </td>
                      <td>
                        <Badge variant={u.is_active ? 'success' : 'secondary'}>
                          {u.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="text-secondary-500 whitespace-nowrap">
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleString('fr-FR') : 'Jamais'}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openHistory(u)}
                            aria-label="Historique de connexion"
                            title="Historique de connexion"
                          >
                            <History className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(u)}
                            aria-label="Modifier"
                            title="Modifier"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(u)}
                            aria-label={u.is_active ? 'Désactiver' : 'Activer'}
                            title={u.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </Button>
                          {u.id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(u)}
                              aria-label="Supprimer"
                              className="text-error-600 hover:text-error-700 hover:bg-error-50"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Précédent
          </Button>
          <span className="text-xs text-secondary-500">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Create / Edit user modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={formMode === 'create' ? 'Nouvel utilisateur' : 'Modifier l’utilisateur'}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submitForm} disabled={saving}>
              {saving ? 'Enregistrement…' : formMode === 'create' ? 'Créer' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Nom complet *"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <Input
            label="Email *"
            type="email"
            value={form.email}
            disabled={formMode === 'edit'}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {formMode === 'create' && (
            <Input
              label="Mot de passe *"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Département"
              value={form.department || ''}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
            <Input
              label="Poste"
              value={form.position || ''}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary-700 mb-1">Rôle</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="input"
            >
              <option value="employee">Employé</option>
              <option value="admin">Administrateur</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-secondary-700">Compte actif</span>
            <Switch
              checked={!!form.is_active}
              onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
            />
          </div>
        </div>
      </Modal>

      {/* Login history modal */}
      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Historique de connexion"
        description={historyUser ? `${historyUser.full_name} · ${historyUser.email}` : undefined}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setHistoryOpen(false)}>
            Fermer
          </Button>
        }
      >
        {historyLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : historyItems.length === 0 ? (
          <p className="text-sm text-secondary-500 text-center py-6">Aucune connexion enregistrée.</p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full table-dense">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Méthode</th>
                  <th>Statut</th>
                  <th>IP</th>
                  <th>Appareil</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((h) => (
                  <tr key={h.id}>
                    <td className="whitespace-nowrap">{new Date(h.created_at).toLocaleString('fr-FR')}</td>
                    <td className="capitalize">{h.method}</td>
                    <td>
                      {h.success ? (
                        <Badge variant="success">Succès</Badge>
                      ) : (
                        <Badge variant="error" title={h.failure_reason || ''}>Échec</Badge>
                      )}
                    </td>
                    <td className="text-secondary-500">{h.ip_address || '—'}</td>
                    <td className="text-secondary-500 truncate max-w-[220px]" title={h.user_agent || ''}>
                      {h.user_agent || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
