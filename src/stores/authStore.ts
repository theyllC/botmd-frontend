'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/user';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (data: Partial<User>) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  department?: string;
  position?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { access_token, refresh_token, user } = response.data;
        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          user,
          isAuthenticated: true,
        });
      },

      register: async (data: RegisterData) => {
        const response = await api.post('/auth/register', data);
        const { access_token, refresh_token, user } = response.data;
        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          user,
          isAuthenticated: true,
        });
      },

      initializeAuth: async () => {
        const { accessToken, refreshToken } = get();
        if (accessToken && refreshToken) {
          try {
            // Verify token is still valid by making a test request
            const response = await api.get('/auth/me');
            set({ user: response.data, isAuthenticated: true, isLoading: false });
          } catch {
            // Token expired or invalid, try to refresh
            try {
              const refreshResponse = await api.post('/auth/refresh', { refresh_token: refreshToken });
              const { access_token, refresh_token: newRefreshToken, user } = refreshResponse.data;
              set({
                accessToken: access_token,
                refreshToken: newRefreshToken,
                user,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch {
              // Refresh failed, logout
              set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          }
        } else {
          // No tokens, not authenticated
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'botmd-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

let authStore: ReturnType<typeof useAuthStore.getState> | null = null;

export const getAuthStore = () => {
  if (!authStore) {
    authStore = useAuthStore.getState();
  }
  return authStore;
};