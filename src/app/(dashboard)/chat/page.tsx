'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ChatIndexPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/chat/new');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Bienvenue sur BoTMD</h1>
          <p className="text-secondary-500 mb-8">
            Votre assistant d'onboarding intelligent. Connectez-vous pour commencer.
          </p>
          <Button size="lg" className="w-full" onClick={() => router.push('/login')}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return <ChatContainer />;
}