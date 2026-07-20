'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chat, ChatListItem, Message } from '@/types/api';

interface ChatState {
  chats: ChatListItem[];
  currentChat: Chat | null;
  currentChatId: string | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  
  // Actions
  setChats: (chats: ChatListItem[]) => void;
  addChat: (chat: ChatListItem) => void;
  updateChat: (chatId: string, data: Partial<ChatListItem>) => void;
  removeChat: (chatId: string) => void;
  setCurrentChat: (chat: Chat | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, data: Partial<Message>) => void;
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  clearCurrentChat: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      chats: [],
      currentChat: null,
      currentChatId: null,
      messages: [],
      isLoading: false,
      isStreaming: false,

      setChats: (chats) => set({ chats }),
      addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),
      updateChat: (chatId, data) => set((state) => ({
        chats: state.chats.map((c) => (c.id === chatId ? { ...c, ...data } : c)),
      })),
      removeChat: (chatId) => set((state) => ({
        chats: state.chats.filter((c) => c.id !== chatId),
        currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
        currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
      })),
      setCurrentChat: (chat) => set({ currentChat: chat, currentChatId: chat?.id || null, messages: chat?.messages || [] }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (messageId, data) => set((state) => ({
        messages: state.messages.map((m) => (m.id === messageId ? { ...m, ...data } : m)),
      })),
      setLoading: (loading) => set({ isLoading: loading }),
      setStreaming: (streaming) => set({ isStreaming: streaming }),
      clearCurrentChat: () => set({ currentChat: null, currentChatId: null, messages: [] }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ chats: state.chats }),
    }
  )
);