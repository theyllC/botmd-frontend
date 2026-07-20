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
import { ScrollArea } from '@/components/ui/ScrollArea';
import { cn, generateId } from '@/lib/utils';
import { Loader2, Bot, MessageSquare, X, Paperclip } from 'lucide-react';
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

  const loadChat = useCallback(async (chatId: string) => {
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
  }, [setLoading, setCurrentChat, setMessages]);

  // Load chats on mount
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadChats();
    }
  }, [isAuthenticated, authLoading, loadChats]);

  // Load initial chat if provided
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
      // Remove from store
      // ... handle removal
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

    // Add user message optimistically
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
      // Create streaming response placeholder
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

      // Send to backend via WebSocket or streaming API
      // For now, use regular API and simulate streaming
      const response = await api.post(`/chats/${currentChatId}/messages`, { content });
      const assistantResponse = response.data;

      // Update assistant message with real response
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
      // Show error message
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
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary-700">Connexion requise</h2>
          <p className="text-secondary-500 mt-2">Veuillez vous connecter pour accéder au chat.</p>
          <Button className="mt-4" onClick={() => router.push('/login')}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-secondary-200 transform transition-transform duration-300 lg:translate-x-0',
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Conversations"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-secondary-200">
            <h2 className="text-lg font-semibold text-secondary-900">Conversations</h2>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setShowMobileSidebar(false)}
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4 border-b border-secondary-200">
            <Button
              className="w-full justify-start gap-2"
              onClick={handleNewChat}
              leftIcon={<MessageSquare className="w-4 h-4" />}
            >
              Nouvelle conversation
            </Button>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1">
            <ChatSidebar
              chats={chats}
              currentChatId={currentChatId}
              onSelectChat={handleSelectChat}
              onNewChat={handleNewChat}
              onDeleteChat={handleDeleteChat}
              isLoading={isLoading}
            />
          </ScrollArea>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 lg:ml-0 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-secondary-200">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSidebar(true)}
              aria-label="Ouvrir le menu"
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
            <div className="flex-1 text-center">
              <h1 className="font-medium text-secondary-900">
                {currentChatId ? 'Conversation' : 'BoTMD'}
              </h1>
            </div>
            <div className="w-10" />
          </div>
        </header>

        {/* Chat Header (Desktop) */}
        <header className="hidden lg:sticky lg:top-0 z-20 bg-white/95 backdrop-blur border-b border-secondary-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-secondary-900">BoTMD</h1>
                <p className="text-xs text-secondary-500">Assistant d'onboarding</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Avatar
                src={user?.avatar_url}
                fallback={user?.full_name}
                size="sm"
              />
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            onFeedback={handleFeedback}
            scrollToBottom={true}
          />

          {/* Typing Indicator */}
          {isStreaming && (
            <div className="px-4 py-3 border-t border-secondary-200 bg-white/95 backdrop-blur">
              <div className="flex items-center gap-2 text-secondary-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">L'assistant réfléchit...</span>
              </div>
            </div>
          )}

          {/* Input Area */}
          <ChatInput
            onSend={handleSendMessage}
            disabled={!currentChatId || isStreaming}
            isStreaming={isStreaming}
            placeholder={currentChatId ? 'Posez votre question...' : 'Sélectionnez ou créez une conversation'}
          />
        </div>
      </main>
    </div>
  );
}