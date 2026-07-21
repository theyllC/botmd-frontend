'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { adminApi } from '@/lib/admin';
import { DOCUMENT_STATUS_LABELS } from '@/types/admin';
import type { DocumentListItem, DocumentStats, ChunkResponse } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import {
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Database,
  AlertCircle,
  CheckCircle2,
  Search,
  Eye,
  Users as UsersIcon,
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
  const [docs, setDocs] = useState<DocumentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<DocumentStats | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [file, setFile] = useState<File | null>(null);
  const [department, setDepartment] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState<DocumentListItem | null>(null);
  const [viewerChunks, setViewerChunks] = useState<ChunkResponse[]>([]);
  const [viewerLoading, setViewerLoading] = useState(false);

  const PAGE_SIZE = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, page_size: PAGE_SIZE };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      const [docRes, statRes] = await Promise.all([
        adminApi.getDocuments(params),
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
  }, [page, search, statusFilter]);

  // Debounced live search
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
      if (fileInputRef.current) fileInputRef.current.value = '';
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Échec de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (d: DocumentListItem) => {
    if (!confirm(`Supprimer "${d.filename}" ?`)) return;
    try {
      await adminApi.deleteDocument(d.id);
      toast.success('Document supprimé');
      load();
    } catch {
      toast.error('Suppression impossible');
    }
  };

  const handleReprocess = async (d: DocumentListItem) => {
    try {
      await adminApi.reprocessDocument(d.id);
      toast.success('Retraitement lancé');
      load();
    } catch {
      toast.error('Action impossible');
    }
  };

  const openViewer = async (d: DocumentListItem) => {
    setViewerDoc(d);
    setViewerOpen(true);
    setViewerChunks([]);
    setViewerLoading(true);
    try {
      const chunks = await adminApi.getDocumentChunks(d.id, { page_size: 100 });
      setViewerChunks(chunks);
    } catch {
      toast.error('Impossible de charger le contenu du document');
    } finally {
      setViewerLoading(false);
    }
  };

  if (user && user.role !== 'admin' && user.role !== 'super_admin') return null;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-secondary-900">Documents RAG</h1>
          <p className="text-xs text-secondary-500">
            Indexation de la base de connaissances · {total} document{total > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="outline" leftIcon={<UsersIcon className="w-3.5 h-3.5" />}>
              Utilisateurs
            </Button>
          </Link>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3 flex items-center gap-2.5">
              <Database className="w-6 h-6 text-primary-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-bold leading-tight text-secondary-900">{stats.total_documents}</p>
                <p className="text-[11px] text-secondary-500">Documents</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-primary-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-bold leading-tight text-secondary-900">{stats.total_chunks}</p>
                <p className="text-[11px] text-secondary-500">Chunks</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-success-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-bold leading-tight text-secondary-900">{stats.by_status.indexed || 0}</p>
                <p className="text-[11px] text-secondary-500">Indexés</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2.5">
              <AlertCircle className="w-6 h-6 text-error-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-bold leading-tight text-secondary-900">{stats.by_status.failed || 0}</p>
                <p className="text-[11px] text-secondary-500">Échecs</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-3 space-y-2.5">
          <p className="text-xs font-semibold text-secondary-700">Ajouter un document</p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-xs text-secondary-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary-50 file:text-primary-700 file:text-xs file:font-medium hover:file:bg-primary-100"
          />
          <div className="flex flex-wrap gap-2.5 items-end">
            <div className="flex-1 min-w-[180px]">
              <Input
                label="Département (optionnel)"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="ex: RH, Juridique"
              />
            </div>
            <label className="flex items-center gap-1.5 text-xs text-secondary-700 pb-1.5">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-secondary-300"
              />
              Public (accessible à tous)
            </label>
            <Button onClick={handleUpload} isLoading={uploading} leftIcon={<Upload className="w-3.5 h-3.5" />}>
              Indexer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 flex flex-wrap gap-2 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Rechercher (nom de fichier...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5" />}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input w-auto h-8"
          >
            <option value="">Tous statuts</option>
            <option value="indexed">Indexés</option>
            <option value="pending">En attente</option>
            <option value="processing">En traitement</option>
            <option value="failed">Échecs</option>
          </select>
          <Button variant="ghost" size="icon" onClick={load} aria-label="Rafraîchir">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <p className="p-8 text-center text-sm text-secondary-500">Aucun document trouvé.</p>
          ) : (
            <div className="divide-y divide-secondary-100">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary-50">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${getDocumentTypeColor(d.file_type)}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <button
                    onClick={() => openViewer(d)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-medium text-[13px] text-secondary-900 truncate hover:text-primary-600">{d.filename}</p>
                      <Badge variant={STATUS_VARIANT[d.status] || 'outline'}>
                        {DOCUMENT_STATUS_LABELS[d.status] || d.status}
                      </Badge>
                      {d.is_public && <Badge variant="outline">Public</Badge>}
                    </div>
                    <p className="text-[11px] text-secondary-400">
                      {formatFileSize(d.file_size)} · {d.chunk_count} chunks ·{' '}
                      {d.department || '—'} · {formatRelativeTime(d.created_at)}
                    </p>
                    {d.error_message && (
                      <p className="text-[11px] text-error-600 mt-0.5">{d.error_message}</p>
                    )}
                  </button>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openViewer(d)}
                      aria-label="Voir le contenu"
                      title="Voir le contenu"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    {(d.status === 'failed' || d.status === 'indexed') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReprocess(d)}
                        aria-label="Retraiter"
                        title="Retraiter"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(d)}
                      aria-label="Supprimer"
                      className="text-error-600 hover:text-error-700 hover:bg-error-50"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Précédent
          </Button>
          <span className="text-xs text-secondary-500">
            Page {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Suivant
          </Button>
        </div>
      )}

      {/* Content viewer modal */}
      <Modal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={viewerDoc?.filename || 'Document'}
        description={
          viewerDoc
            ? `${formatFileSize(viewerDoc.file_size)} · ${viewerDoc.chunk_count} chunks · ${viewerDoc.department || 'Aucun département'}`
            : undefined
        }
        size="lg"
        footer={
          <>
            {viewerDoc && (
              <Button
                variant="outline"
                className="text-error-600 hover:bg-error-50"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  setViewerOpen(false);
                  handleDelete(viewerDoc);
                }}
              >
                Supprimer
              </Button>
            )}
            <Button variant="outline" onClick={() => setViewerOpen(false)}>
              Fermer
            </Button>
          </>
        }
      >
        {viewerLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : viewerChunks.length === 0 ? (
          <p className="text-sm text-secondary-500 text-center py-6">
            Aucun contenu indexé pour ce document (traitement en attente ou échoué).
          </p>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {viewerChunks.map((c) => (
              <div key={c.id} className="rounded-md border border-secondary-200 bg-secondary-50 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-secondary-500 uppercase tracking-wide">
                    Extrait #{c.chunk_index + 1}
                  </span>
                  <span className="text-[11px] text-secondary-400">{c.token_count} tokens</span>
                </div>
                <p className="text-[13px] text-secondary-800 whitespace-pre-wrap leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
