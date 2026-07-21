export type UserRole = 'employee' | 'admin' | 'super_admin';

export interface UserListItem {
  id: string;
  email: string;
  full_name: string;
  department: string | null;
  position: string | null;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface UserUpdateAdmin {
  full_name?: string | null;
  department?: string | null;
  position?: string | null;
  role?: string | null;
  is_active?: boolean | null;
}

export interface UserCreateAdmin {
  email: string;
  full_name: string;
  password: string;
  department?: string | null;
  position?: string | null;
  role?: string;
  is_active?: boolean;
}

export interface LoginHistoryItem {
  id: string;
  user_id: string | null;
  email: string;
  success: boolean;
  method: string;
  ip_address: string | null;
  user_agent: string | null;
  failure_reason: string | null;
  created_at: string;
}

export interface LoginHistoryListResponse {
  items: LoginHistoryItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AdminUsersListResponse {
  items: UserListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  by_role: Record<string, number>;
  by_department: Record<string, number>;
  new_this_month: number;
}

export interface ChatStats {
  total_chats: number;
  total_messages: number;
  avg_messages_per_chat: number;
  active_today: number;
}

export interface DocumentStats {
  total_documents: number;
  total_chunks: number;
  total_size_bytes: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  by_department: Record<string, number>;
}

export interface SystemStats {
  users: UserStats;
  chats: ChatStats;
  documents: DocumentStats;
  timestamp: string;
}

export interface DocumentListItem {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: string;
  department: string | null;
  is_public: boolean;
  chunk_count: number;
  uploaded_by: string | null;
  error_message: string | null;
  created_at: string;
  indexed_at: string | null;
  updated_at: string | null;
}

export interface ChunkResponse {
  id: string;
  chunk_index: number;
  content: string;
  token_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DocumentWithChunks extends DocumentListItem {
  chunks: ChunkResponse[];
}

export interface DocumentListResponse {
  items: DocumentListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const ROLE_LABELS: Record<string, string> = {
  employee: 'Employé',
  admin: 'Administrateur',
  super_admin: 'Super Admin',
};

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  processing: 'Traitement',
  indexed: 'Indexé',
  failed: 'Échec',
  deleted: 'Supprimé',
};
