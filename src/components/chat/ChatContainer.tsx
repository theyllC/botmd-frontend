'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Message } from '@/types/api';
import { api } from '@/lib/api';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';
import { cn, generateId } from '@/lib/utils';
import { Loader2, Bot, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

interface ChatContainerProps {
  initialChatId?: string;
}

export function ChatContainer({ initialChatId }: ChatContainerProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const {
    chats,
    currentChatId,
    messages,
    isLoading,
    isStreaming,
    setChats,
    addChat,
    setCurrentChat,
    setMessages,
    addMessage,
    updateMessage,
    setLoading,
    setStreaming,
    clearCurrentChat,
  } = useChatStore();

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadChats = useCallback(async () => {
    try {
      const response = await api.get('/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  }, [setChats]);

  const loadChat = useCallback(
    async (chatId: string) => {
      setLoading(true);
      try {
        const response = await api.get(`/chats/${chatId}`);
        setCurrentChat(response.data);
        setMessages(response.data.messages || []);
      } catch (error) {
        console.error('Failed to load chat:', error);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setCurrentChat, setMessages]
  );

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadChats();
    }
  }, [isAuthenticated, authLoading, loadChats]);

  useEffect(() => {
    if (initialChatId && isAuthenticated && !authLoading) {
      loadChat(initialChatId);
    }
  }, [initialChatId, isAuthenticated, authLoading, loadChat]);

  const handleNewChat = async () => {
    try {
      const response = await api.post('/chats', {
        title: 'Nouvelle conversation',
      });
      const newChat = response.data;
      addChat(newChat);
      setCurrentChat(newChat);
      setMessages([]);
      router.push(`/chat/${newChat.id}`);
      setShowMobileSidebar(false);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleSelectChat = (chatId: string) => {
    loadChat(chatId);
    setShowMobileSidebar(false);
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm('Supprimer cette conversation ?')) return;
    try {
      await api.delete(`/chats/${chatId}`);
      if (currentChatId === chatId) {
        clearCurrentChat();
        router.push('/chat');
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentChatId) return;

    setStreaming(true);

    const userMessageId = generateId();
    const userMessage: Message = {
      id: userMessageId,
      chat_id: currentChatId,
      sender: 'user',
      content,
      sources: [],
      model_used: null,
      tokens_prompt: null,
      tokens_completion: null,
      response_time_ms: null,
      created_at: new Date().toISOString(),
    };
    addMessage(userMessage);

    try {
      const assistantMessageId = generateId();
      const assistantMessage: Message = {
        id: assistantMessageId,
        chat_id: currentChatId,
        sender: 'assistant',
        content: '',
        sources: [],
        model_used: 'streaming',
        tokens_prompt: null,
        tokens_completion: null,
        response_time_ms: null,
        created_at: new Date().toISOString(),
      };
      addMessage(assistantMessage);

      const response = await api.post(`/chats/${currentChatId}/messages`, { content });
      const assistantResponse = response.data;

      updateMessage(assistantMessageId, {
        content: assistantResponse.content,
        sources: assistantResponse.sources || [],
        model_used: assistantResponse.model_used,
        tokens_prompt: assistantResponse.tokens_prompt,
        tokens_completion: assistantResponse.tokens_completion,
        response_time_ms: assistantResponse.response_time_ms,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setStreaming(false);
    }
  };

  const handleFeedback = async (messageId: string, helpful: boolean) => {
    try {
      await api.post(`/chats/${currentChatId}/feedback`, {
        message_id: messageId,
        is_helpful: helpful,
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
            <MessageSquare className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-xl font-semibold text-secondary-900">Connexion requise</h2>
          <p className="text-secondary-500 mt-2">Veuillez vous connecter pour accéder au chat.</p>
          <Button className="mt-5" onClick={() => router.push('/login')}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex min-h-0 bg-white">
      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-40 bg-secondary-900/30 backdrop-blur-sm lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-80 bg-secondary-50/70 lg:bg-secondary-50/40 border-r border-secondary-200/80 transform transition-transform duration-300 ease-out lg:translate-x-0',
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Conversations"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b border-secondary-200/80 lg:hidden">
            <h2 className="text-base font-semibold text-secondary-900">Conversations</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSidebar(false)}
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <ChatSidebar
            chats={chats}
            currentChatId={currentChatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            isLoading={isLoading}
          />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="lg:hidden sticky top-0 z-30 glass border-b border-secondary-200/80">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSidebar(true)}
              aria-label="Ouvrir les conversations"
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
            <h1 className="font-medium text-secondary-900">{currentChatId ? 'Conversation' : 'BoTMD'}</h1>
            <div className="w-10" />
          </div>
        </header>

        <header className="hidden lg:flex sticky top-0 z-20 glass border-b border-secondary-200/80">
          <div className="flex items-center justify-between h-16 px-6 w-full">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-[15px] font-semibold text-secondary-900 leading-tight">BoTMD</h1>
                <p className="text-xs text-secondary-500">Assistant d&apos;onboarding</p>
              </div>
            </div>
            <Avatar src={user?.avatar_url} fallback={user?.full_name} size="sm" />
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            onFeedback={handleFeedback}
            scrollToBottom={true}
          />

          <ChatInput
            onSend={handleSendMessage}
            disabled={!currentChatId || isStreaming}
            isStreaming={isStreaming}
            placeholder={currentChatId ? 'Posez votre question…' : 'Sélectionnez ou créez une conversation'}
          />
        </div>
      </main>
    </div>
  );
}
