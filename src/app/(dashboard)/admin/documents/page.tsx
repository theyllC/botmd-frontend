'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { adminApi } from '@/lib/admin';
import { DOCUMENT_STATUS_LABELS } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Database,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatFileSize, formatRelativeTime, getDocumentTypeColor } from '@/lib/utils';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'secondary' | 'outline'> = {
  indexed: 'success',
  pending: 'warning',
  processing: 'warning',
  failed: 'error',
  deleted: 'secondary',
};

export default function AdminDocumentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<import('@/types/admin').DocumentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<import('@/types/admin').DocumentStats | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [department, setDepartment] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);

  const PAGE_SIZE = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [docRes, statRes] = await Promise.all([
        adminApi.getDocuments({ page, page_size: PAGE_SIZE }),
        adminApi.getDocumentStats(),
      ]);
      setDocs(docRes.items);
      setTotal(docRes.total);
      setStats(statRes);
    } catch {
      toast.error('Impossible de charger les documents');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.replace('/chat');
      return;
    }
    load();
  }, [user, router, load]);

  const handleUpload = async () => {
    if (!file) {
      toast.error('Sélectionnez un fichier');
      return;
    }
    setUploading(true);
    try {
      await adminApi.uploadDocument(file, { department: department || undefined, is_public: isPublic });
      toast.success('Document envoyé, traitement en cours');
      setFile(null);
      setDepartment('');
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || 'Échec de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (d: import('@/types/admin').DocumentListItem) => {
    if (!confirm(`Supprimer "${d.filename}" ?`)) return;
    try {
      await adminApi.deleteDocument(d.id);
      toast.success('Document supprimé');
      load();
    } catch {
      toast.error('Suppression impossible');
    }
  };

  const handleReprocess = async (d: import('@/types/admin').DocumentListItem) => {
    try {
      await adminApi.reprocessDocument(d.id);
      toast.success('Retraitement lancé');
      load();
    } catch {
      toast.error('Action impossible');
    }
  };

  if (user && user.role !== 'admin' && user.role !== 'super_admin') return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Documents RAG</h1>
        <p className="text-sm text-secondary-500">
          Indexez des documents pour alimenter la base de connaissances du chatbot.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Database className="w-8 h-8 text-primary-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total_documents}</p>
                <p className="text-xs text-secondary-500">Documents</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total_chunks}</p>
                <p className="text-xs text-secondary-500">Chunks</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.by_status.indexed || 0}</p>
                <p className="text-xs text-secondary-500">Indexés</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-error-600" />
              <div>
                <p className="text-2xl font-bold">{stats.by_status.failed || 0}</p>
                <p className="text-xs text-secondary-500">Échecs</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Nouveau document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-secondary-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <Input
                label="Département (optionnel)"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="ex: RH, Juridique"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-secondary-700 pb-2.5">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-secondary-300"
              />
              Public (accessible à tous)
            </label>
            <Button onClick={handleUpload} isLoading={uploading} leftIcon={<Upload className="w-4 h-4" />}>
              Indexer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> Documents indexés
            </span>
            <Button variant="ghost" size="icon" onClick={load} aria-label="Rafraîchir">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <p className="p-8 text-center text-secondary-500">Aucun document indexé.</p>
          ) : (
            <div className="divide-y divide-secondary-100">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-4 hover:bg-secondary-50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getDocumentTypeColor(d.file_type)}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-secondary-900 truncate">{d.filename}</p>
                      <Badge variant={STATUS_VARIANT[d.status] || 'outline'}>
                        {DOCUMENT_STATUS_LABELS[d.status] || d.status}
                      </Badge>
                      {d.is_public && <Badge variant="outline">Public</Badge>}
                    </div>
                    <p className="text-xs text-secondary-400">
                      {formatFileSize(d.file_size)} · {d.chunk_count} chunks ·{' '}
                      {d.department || '—'} · {formatRelativeTime(d.created_at)}
                    </p>
                    {d.error_message && (
                      <p className="text-xs text-error-600 mt-0.5">{d.error_message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {(d.status === 'failed' || d.status === 'indexed') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReprocess(d)}
                        aria-label="Retraiter"
                        title="Retraiter"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(d)}
                      aria-label="Supprimer"
                      className="text-error-600 hover:text-error-700 hover:bg-error-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
