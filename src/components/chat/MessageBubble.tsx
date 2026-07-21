'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { SourceReference } from '@/types/api';
import type { Message } from '@/types/api';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/Tooltip';
import { ThumbsUp, ThumbsDown, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  onFeedback?: (messageId: string, helpful: boolean) => void;
  hasGivenFeedback?: boolean;
  feedbackValue?: boolean;
}

export function MessageBubble({ message, isStreaming, onFeedback, hasGivenFeedback, feedbackValue }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isAssistant = message.sender === 'assistant';
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4" role="status">
        <div className="bg-warning-50 border border-warning-200 text-warning-800 px-4 py-2 rounded-full text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-2.5 max-w-[85%] sm:max-w-[75%] animate-fade-in',
        isUser && 'flex-row-reverse ml-auto',
        isAssistant && 'mr-auto'
      )}
      role="article"
      aria-label={isUser ? 'Votre message' : 'Réponse de l\u2019assistant'}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          isUser ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-white' : 'bg-secondary-100 text-secondary-600 ring-1 ring-secondary-200'
        )}
        aria-hidden="true"
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div
        className={cn(
          'relative rounded-[20px] px-4 py-3 shadow-sm',
          isUser
            ? 'bg-primary-500 text-white rounded-tr-md'
            : 'bg-secondary-100 text-secondary-900 rounded-tl-md'
        )}
      >
        <div className={cn('prose prose-sm max-w-none', isUser && 'prose-invert')}>
          {isStreaming ? (
            <span className="inline-flex items-center gap-1">
              {message.content}
              <span className="inline-flex gap-0.5" aria-hidden="true">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-soft [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-soft [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-soft [animation-delay:300ms]" />
              </span>
            </span>
          ) : (
            <MarkdownRenderer content={message.content} isUser={isUser} />
          )}
        </div>

        {message.sources && message.sources.length > 0 && !isUser && (
          <SourcesDisplay sources={message.sources} />
        )}

        <div
          className={cn(
            'flex items-center gap-3 mt-2 pt-2 border-t',
            isUser ? 'border-white/20' : 'border-secondary-200/70'
          )}
        >
          <time
            className={cn('text-xs', isUser ? 'text-white/70' : 'text-secondary-500')}
            dateTime={message.created_at}
          >
            {formatRelativeTime(message.created_at)}
          </time>

          {isAssistant && !isStreaming && (
            <div className="flex items-center gap-1 ml-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onFeedback?.(message.id, true)}
                    disabled={hasGivenFeedback}
                    className={cn(
                      'p-1 rounded-md hover:bg-primary-100 transition-colors duration-150',
                      hasGivenFeedback && feedbackValue && 'text-primary-600',
                      !hasGivenFeedback && 'text-secondary-400 hover:text-primary-600'
                    )}
                    aria-label="Utile"
                  >
                    <ThumbsUp className={cn('w-3.5 h-3.5', hasGivenFeedback && feedbackValue && 'fill-current')} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{hasGivenFeedback && feedbackValue ? 'Utile' : 'Cette réponse m\u2019a aidé'}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onFeedback?.(message.id, false)}
                    disabled={hasGivenFeedback}
                    className={cn(
                      'p-1 rounded-md hover:bg-error-100 transition-colors duration-150',
                      hasGivenFeedback && !feedbackValue && 'text-error-600',
                      !hasGivenFeedback && 'text-secondary-400 hover:text-error-600'
                    )}
                    aria-label="Pas utile"
                  >
                    <ThumbsDown className={cn('w-3.5 h-3.5', hasGivenFeedback && !feedbackValue && 'fill-current')} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{hasGivenFeedback && !feedbackValue ? 'Pas utile' : 'Cette réponse ne m\u2019a pas aidé'}</TooltipContent>
              </Tooltip>
              {message.model_used && (
                <span className="text-[10px] text-secondary-400 px-2 py-0.5 rounded-full bg-secondary-200/60">
                  {message.model_used}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MarkdownRenderer({ content, isUser }: { content: string; isUser: boolean }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code: ({ children, ...props }) => {
          const inline = props.className ? false : true;
          return inline ? (
            <code
              className={cn(
                'px-1.5 py-0.5 rounded text-sm font-mono',
                isUser ? 'bg-white/20' : 'bg-secondary-200/70'
              )}
              {...props}
            >
              {children}
            </code>
          ) : (
            <pre className="bg-secondary-900 text-secondary-100 p-4 rounded-xl overflow-x-auto">
              <code {...props}>{children}</code>
            </pre>
          );
        },
        a: ({ href, children, ...props }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn('underline underline-offset-2', isUser ? 'text-white' : 'text-primary-600 hover:text-primary-700')}
            {...props}
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

interface SourcesDisplayProps {
  sources: SourceReference[];
}

function SourcesDisplay({ sources }: SourcesDisplayProps) {
  return (
    <div className="mt-3 pt-3 border-t border-secondary-200/70">
      <p className="text-xs font-medium text-secondary-600 mb-2">Sources :</p>
      <div className="space-y-1.5">
        {sources.map((source, index) => (
          <div key={`${source.document_id}-${source.chunk_index}`} className="text-xs">
            <span className="text-secondary-500">[{index + 1}]</span>
            <span className="font-medium text-secondary-700 ml-1">{source.filename}</span>
            <span className="text-secondary-500 ml-1">(chunk {source.chunk_index})</span>
            <span className="text-secondary-400 ml-1">({Math.round(source.similarity * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
