'use client';

import { useRef, useEffect } from 'react';
import { Message } from '@/types/user';
import { cn } from '@/lib/utils';
import { MessageBubble } from './MessageBubble';
import { Loader2, Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  isStreaming?: boolean;
  onFeedback?: (messageId: string, helpful: boolean) => void;
  scrollToBottom?: boolean;
}

export function MessageList({ messages, isLoading, isStreaming, onFeedback, scrollToBottom }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming, scrollToBottom]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <Bot className="w-12 h-12 text-secondary-300 mb-4" />
        <h3 className="text-lg font-medium text-secondary-700">Bienvenue !</h3>
        <p className="text-secondary-500 mt-1 max-w-xs">
          Posez-moi vos questions sur l'entreprise, les processus, les avantages, etc.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" ref={scrollAreaRef}>
      <div className="flex flex-col gap-4 p-4 pb-8">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={isStreaming && message.id === messages[messages.length - 1]?.id}
            onFeedback={onFeedback}
          />
        ))}

        {isStreaming && (
          <div className={cn('flex gap-3 animate-fade-in', 'justify-start')}>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-secondary-600" />
            </div>
            <div className="bg-secondary-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-secondary-200">
              <div className="flex items-center gap-2 text-secondary-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Réflexion en cours...</span>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}