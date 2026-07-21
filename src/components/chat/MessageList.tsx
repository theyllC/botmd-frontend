'use client';

import { useRef, useEffect } from 'react';
import { Message } from '@/types/user';
import { MessageBubble } from './MessageBubble';
import { Bot } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-5">
          <Bot className="w-8 h-8 text-primary-500" />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900">Bienvenue !</h3>
        <p className="text-secondary-500 mt-1.5 max-w-xs text-[15px]">
          Posez-moi vos questions sur l&apos;entreprise, les processus, les avantages, etc.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" ref={scrollAreaRef}>
      <div className="flex flex-col gap-4 p-4 sm:p-6 pb-8 max-w-3xl mx-auto w-full">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={isStreaming && message.id === messages[messages.length - 1]?.id}
            onFeedback={onFeedback}
          />
        ))}

        {isLoading && (
          <div className="flex justify-center py-8" role="status" aria-label="Chargement">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse-soft [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse-soft [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse-soft [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
