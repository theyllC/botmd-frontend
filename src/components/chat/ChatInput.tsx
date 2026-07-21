'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/Tooltip';
import { Paperclip, Send, X, Mic2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isStreaming?: boolean;
}

export function ChatInput({ onSend, disabled, placeholder = 'Écrivez votre message...', isStreaming }: ChatInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !disabled && !isStreaming) {
      onSend(content.trim());
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [content]);

  return (
    <form onSubmit={handleSubmit} className="w-full border-t border-secondary-200/80 glass">
      <div className="flex items-end gap-2 p-3 sm:p-4 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isStreaming}
            aria-label="Message"
            className={cn('pr-24 !min-h-[48px] resize-none rounded-2xl bg-secondary-100/80', disabled && 'opacity-70')}
            rows={1}
            style={{ minHeight: '48px', maxHeight: '200px' }}
          />
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={disabled}
                  aria-label="Joindre un fichier"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Joindre un fichier</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={disabled}
                  aria-label="Dicter un message"
                >
                  <Mic2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Dicter un message</TooltipContent>
            </Tooltip>
            <Button
              type="submit"
              variant="primary"
              size="icon"
              className="h-8 w-8"
              disabled={!content.trim() || disabled || isStreaming}
              aria-label={isStreaming ? 'Arrêter la génération' : 'Envoyer le message'}
            >
              {isStreaming ? <X className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
