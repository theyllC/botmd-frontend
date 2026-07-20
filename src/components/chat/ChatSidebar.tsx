'use client';

import { ChatListItem } from '@/types/user';
import { cn, formatRelativeTime, truncate } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, MessageSquare, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface ChatSidebarProps {
  chats: ChatListItem[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  isLoading?: boolean;
}

export function ChatSidebar({ chats, currentChatId, onSelectChat, onNewChat, onDeleteChat, isLoading }: ChatSidebarProps) {
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleDelete = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Supprimer cette conversation ?')) {
      onDeleteChat(chatId);
    }
    setShowMenu(null);
  };

  const handleMenuClick = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(showMenu === chatId ? null : chatId);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-secondary-200 hidden lg:flex">
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-900">Conversations</h2>
          <Button onClick={onNewChat} variant="ghost" size="icon" className="h-8 w-8" aria-label="Nouvelle conversation">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse bg-secondary-100 rounded-lg" />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
            <h3 className="text-secondary-700 font-medium">Aucune conversation</h3>
            <p className="text-secondary-500 text-sm mt-1">Commencez une nouvelle discussion</p>
            <Button onClick={onNewChat} className="mt-4" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Nouvelle conversation
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-secondary-100">
            {chats.map((chat) => (
              <li key={chat.id} className="relative">
                <div className="relative">
                  <button
                    onClick={() => onSelectChat(chat.id)}
                    className={cn(
                      'w-full p-3 text-left hover:bg-secondary-50 transition-colors relative group',
                      currentChatId === chat.id && 'bg-primary-50 border-r-2 border-primary-600'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        fallback={chat.title?.charAt(0) || 'C'}
                        size="sm"
                        className={cn('bg-primary-100 text-primary-700', currentChatId === chat.id && 'bg-primary-600 text-white')}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={cn('font-medium text-sm truncate', currentChatId === chat.id ? 'text-primary-700' : 'text-secondary-900')}>
                            {chat.title || 'Nouvelle conversation'}
                          </h4>
                          <button
                            onClick={(e) => handleMenuClick(chat.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-secondary-200 text-secondary-400 hover:text-secondary-600 transition-all"
                            aria-label="Plus d'options"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {chat.last_message && (
                        <p className="text-xs text-secondary-500 truncate mt-1 line-clamp-1">
                          {truncate(chat.last_message, 60)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="secondary" className="text-[10px]">
                          {chat.message_count} msg
                        </Badge>
                        {chat.last_message_at && (
                          <span className="text-[10px] text-secondary-400">
                            {formatRelativeTime(chat.last_message_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {showMenu === chat.id && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 animate-fade-in">
                      <div className="bg-white rounded-lg shadow-lg border border-secondary-200 py-1 min-w-[140px]">
                        <button
                          onClick={() => {
                            onSelectChat(chat.id);
                            setShowMenu(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50"
                        >
                          Ouvrir
                        </button>
                        <button
                          onClick={(e) => handleDelete(chat.id, e)}
                          className="w-full px-3 py-2 text-left text-sm text-error-600 hover:bg-secondary-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}