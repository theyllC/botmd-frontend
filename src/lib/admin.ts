import { api } from '@/lib/api';
import {
  AdminUsersListResponse,
  UserListItem,
  UserUpdateAdmin,
  SystemStats,
  DocumentListResponse,
  DocumentListItem,
  DocumentStats,
} from '@/types/admin';

export interface AdminUsersParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
  department?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const adminApi = {
  // --- Users (admin) ---
  async getUsers(params: AdminUsersParams = {}): Promise<AdminUsersListResponse> {
    const { data } = await api.get<AdminUsersListResponse>('/admin/users', { params });
    return data;
  },

  async updateUser(userId: string, payload: UserUpdateAdmin): Promise<UserListItem> {
    const { data } = await api.put<UserListItem>(`/admin/users/${userId}`, payload);
    return data;
  },

  async activateUser(userId: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(`/admin/users/${userId}/activate`);
    return data;
  },

  async deactivateUser(userId: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(`/admin/users/${userId}/deactivate`);
    return data;
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/admin/users/${userId}`);
    return data;
  },

  // --- Documents (admin / RAG) ---
  async getDocuments(params: Record<string, unknown> = {}): Promise<DocumentListResponse> {
    const { data } = await api.get<DocumentListResponse>('/documents', { params });
    return data;
  },

  async uploadDocument(file: File, options: { department?: string; is_public?: boolean } = {}): Promise<DocumentListItem> {
    const form = new FormData();
    form.append('file', file);
    if (options.department) form.append('department', options.department);
    if (options.is_public !== undefined) form.append('is_public', String(options.is_public));
    const { data } = await api.post<DocumentListItem>('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async deleteDocument(docId: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/documents/${docId}`);
    return data;
  },

  async reprocessDocument(docId: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(`/documents/${docId}/reprocess`);
    return data;
  },

  async getDocumentStats(): Promise<DocumentStats> {
    const { data } = await api.get<DocumentStats>('/documents/stats');
    return data;
  },

  // --- Super admin ---
  async getSystemStats(): Promise<SystemStats> {
    const { data } = await api.get<SystemStats>('/admin/stats');
    return data;
  },
};
