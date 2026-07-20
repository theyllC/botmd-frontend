'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { adminApi, type AdminUsersParams } from '@/lib/admin';
import { ROLE_LABELS } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  Search,
  Trash2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<import('@/types/admin').UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const PAGE_SIZE = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: AdminUsersParams = { page, page_size: PAGE_SIZE };
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
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
  }, [page, search, roleFilter, activeFilter]);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.replace('/chat');
      return;
    }
    load();
  }, [user, router, load]);

  const handleToggleActive = async (u: import('@/types/admin').UserListItem) => {
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

  const handleDelete = async (u: import('@/types/admin').UserListItem) => {
    if (!confirm(`Supprimer définitivement ${u.full_name} ?`)) return;
    try {
      await adminApi.deleteUser(u.id);
      toast.success(`${u.full_name} supprimé`);
      load();
    } catch {
      toast.error('Suppression impossible');
    }
  };

  if (user && user.role !== 'admin' && user.role !== 'super_admin') return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Administration</h1>
          <p className="text-sm text-secondary-500">Gestion des utilisateurs ({total} au total)</p>
        </div>
        <Link href="/admin/documents">
          <Button variant="outline" leftIcon={<ShieldAlert className="w-4 h-4" />}>
            Documents RAG
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Rechercher (nom, email...)"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-secondary-300 px-3 py-2.5 text-sm bg-white"
          >
            <option value="">Tous rôles</option>
            <option value="employee">Employé</option>
            <option value="admin">Administrateur</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-secondary-300 px-3 py-2.5 text-sm bg-white"
          >
            <option value="">Tous statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
          <Button variant="ghost" size="icon" onClick={load} aria-label="Rafraîchir">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" /> Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="p-8 text-center text-secondary-500">Aucun utilisateur trouvé.</p>
          ) : (
            <div className="divide-y divide-secondary-100">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-4 hover:bg-secondary-50">
                  <Avatar src={null} fallback={u.full_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-secondary-900 truncate">{u.full_name}</p>
                      <Badge variant={u.is_active ? 'success' : 'secondary'}>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Badge variant="outline">{ROLE_LABELS[u.role] || u.role}</Badge>
                    </div>
                    <p className="text-sm text-secondary-500 truncate">{u.email}</p>
                    <p className="text-xs text-secondary-400">
                      {u.department || '—'} {u.position ? `· ${u.position}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(u)}
                      aria-label={u.is_active ? 'Désactiver' : 'Activer'}
                      title={u.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </Button>
                    {u.id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(u)}
                        aria-label="Supprimer"
                        className="text-error-600 hover:text-error-700 hover:bg-error-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Précédent
          </Button>
          <span className="text-sm text-secondary-500">
            Page {page} / {Math.ceil(total / PAGE_SIZE)}
          </span>
          <Button
            variant="outline"
            disabled={page >= Math.ceil(total / PAGE_SIZE)}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
