'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { adminApi } from '@/lib/admin';
import { ROLE_LABELS } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Users,
  MessageSquare,
  Database,
  RefreshCw,
  Activity,
  Crown,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatFileSize, formatDateTime } from '@/lib/utils';

export default function SuperAdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<import('@/types/admin').SystemStats | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSystemStats();
      setStats(res);
    } catch {
      toast.error('Impossible de charger les statistiques système');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      router.replace('/chat');
      return;
    }
    load();
  }, [user, router]);

  if (user && user.role !== 'super_admin') return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary-600" /> Vue globale
          </h1>
          <p className="text-sm text-secondary-500">Supervision système en temps réel</p>
        </div>
        <Button variant="outline" onClick={load} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Rafraîchir
        </Button>
      </div>

      {loading || !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-8 h-8 text-primary-600" />
                  <span className="font-semibold text-secondary-700">Utilisateurs</span>
                </div>
                <p className="text-3xl font-bold">{stats.users.total_users}</p>
                <p className="text-sm text-secondary-500">
                  {stats.users.active_users} actifs · {stats.users.new_this_month} ce mois
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                  <span className="font-semibold text-secondary-700">Conversations</span>
                </div>
                <p className="text-3xl font-bold">{stats.chats.total_chats}</p>
                <p className="text-sm text-secondary-500">
                  {stats.chats.total_messages} messages · {stats.chats.active_today} aujourd'hui
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-8 h-8 text-green-600" />
                  <span className="font-semibold text-secondary-700">Documents</span>
                </div>
                <p className="text-3xl font-bold">{stats.documents.total_documents}</p>
                <p className="text-sm text-secondary-500">
                  {formatFileSize(stats.documents.total_size_bytes)} · {stats.documents.total_chunks} chunks
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par rôle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(stats.users.by_role).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <Badge variant="outline">{ROLE_LABELS[role] || role}</Badge>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents par statut</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(stats.documents.by_status).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge variant="secondary">{status}</Badge>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Départements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(stats.users.by_department).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-sm text-secondary-600">{dept || '—'}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <p className="text-xs text-secondary-400 text-right">
            Dernière mise à jour : {formatDateTime(stats.timestamp)}
          </p>
        </>
      )}
    </div>
  );
}
