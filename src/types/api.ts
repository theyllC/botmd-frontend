export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'employee' | 'admin' | 'super_admin';
  department: string | null;
  position: string | null;
  locale: string;
  is_active: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  avatar_url?: string | null;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ChatSender {
  USER: 'user';
  ASSISTANT: 'assistant';
  SYSTEM: 'system';
}

export type ChatSenderType = 'user' | 'assistant' | 'system';

export interface SourceReference {
  document_id: string;
  filename: string;
  chunk_index: number;
  content_preview: string;
  similarity: number;
}

export interface Message {
  id: string;
  chat_id: string;
  sender: ChatSenderType;
  content: string;
  sources: SourceReference[];
  model_used: string | null;
  tokens_prompt: number | null;
  tokens_completion: number | null;
  response_time_ms: number | null;
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  department_context: string | null;
  is_active: boolean;
  message_count: number;
  created_at: string;
  updated_at: string;
  messages?: Message[];
  last_message?: string | null;
  last_message_at?: string | null;
}

export interface ChatListItem {
  id: string;
  title: string;
  department_context: string | null;
  message_count: number;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentType {
  PDF: 'pdf';
  DOCX: 'docx';
  TXT: 'txt';
  MD: 'md';
  XLSX: 'xlsx';
  CSV: 'csv';
  PPTX: 'pptx';
  IMAGE: 'image';
}

export type DocumentTypeValue = 'pdf' | 'docx' | 'txt' | 'md' | 'xlsx' | 'csv' | 'pptx' | 'image';

export interface DocumentStatus {
  PENDING: 'pending';
  PROCESSING: 'processing';
  COMPLETED: 'completed';
  FAILED: 'failed';
}

export type DocumentStatusValue = 'pending' | 'processing' | 'completed' | 'failed';

export interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  document_type: DocumentTypeValue;
  status: DocumentStatusValue;
  uploaded_by: string;
  department: string | null;
  tags: string[];
  chunk_count: number;
  error_message: string | null;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChunkResponse {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  token_count: number;
  has_embedding: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DocumentWithChunks extends Document {
  chunks: ChunkResponse[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SystemStats {
  users: UserStats;
  chats: ChatStats;
  documents: DocumentStats;
  timestamp: string;
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

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string | null;
  position: string | null;
  is_active: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  oauth_providers: string[];
}

export interface AdminChat {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  title: string;
  message_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_message: string | null;
  last_message_at: string | null;
}

export interface APIError {
  detail: string;
}