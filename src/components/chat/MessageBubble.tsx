'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { SourceReference } from '@/types/api';
import type { Message } from '@/types/api';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/Tooltip';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
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
      <div className="flex justify-center my-4">
        <div className="bg-warning-50 border border-warning-200 text-warning-800 px-4 py-2 rounded-full text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-3 max-w-[85%] animate-fade-in', isUser && 'flex-row-reverse justify-end', isAssistant && 'justify-start')}>
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium', isUser ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600')}>
        {isUser ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        )}
      </div>

      <div className={cn('relative rounded-2xl px-4 py-3', isUser ? 'bg-primary-50 text-secondary-900 rounded-tr-sm' : 'bg-secondary-50 text-secondary-900 rounded-tl-sm border border-secondary-200')}>
        <div className="prose prose-sm max-w-none">
          {isStreaming ? (
            <span className="inline-block animate-pulse">{message.content}</span>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {message.sources && message.sources.length > 0 && !isUser && (
          <SourcesDisplay sources={message.sources} />
        )}

        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-secondary-200/50">
          <time className="text-xs text-secondary-500">
            {formatRelativeTime(message.created_at)}
          </time>

          {isAssistant && !isStreaming && (
            <div className="flex items-center gap-1 ml-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onFeedback?.(message.id, true)}
                    disabled={hasGivenFeedback}
                    className={cn('p-1 rounded hover:bg-primary/10 transition-colors', hasGivenFeedback && feedbackValue && 'text-primary-600', !hasGivenFeedback && 'text-secondary-400 hover:text-primary-600')}
                    aria-label="Utile"
                  >
                    <ThumbsUp className={cn('w-4 h-4', hasGivenFeedback && feedbackValue && 'fill-current')} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{hasGivenFeedback && feedbackValue ? 'Utile' : 'Cette réponse m\'a aidé'}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onFeedback?.(message.id, false)}
                    disabled={hasGivenFeedback}
                    className={cn('p-1 rounded hover:bg-error/10 transition-colors', hasGivenFeedback && !feedbackValue && 'text-error-600', !hasGivenFeedback && 'text-secondary-400 hover:text-error-600')}
                    aria-label="Pas utile"
                  >
                    <ThumbsDown className={cn('w-4 h-4', hasGivenFeedback && !feedbackValue && 'fill-current')} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{hasGivenFeedback && !feedbackValue ? 'Pas utile' : 'Cette réponse ne m\'a pas aidé'}</TooltipContent>
              </Tooltip>
              {message.model_used && (
                <span className="text-xs text-secondary-400 px-2 py-0.5 rounded bg-secondary-100">
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

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code: ({ children, ...props }) => {
          const inline = props.className ? false : true;
          return inline ? (
            <code className="bg-secondary-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          ) : (
            <pre className="bg-secondary-900 text-secondary-100 p-4 rounded-lg overflow-x-auto"><code {...props}>{children}</code></pre>
          );
        },
        a: ({ href, children, ...props }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline" {...props}>
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
    <div className="mt-3 pt-3 border-t border-secondary-200/50">
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