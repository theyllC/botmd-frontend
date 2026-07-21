'use client';

import { ChatListItem } from '@/types/user';
import { cn, formatRelativeTime, truncate } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
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
    <div className="flex flex-col h-full">
      <div className="p-4 hidden lg:block">
        <Button onClick={onNewChat} className="w-full justify-start gap-2" leftIcon={<Plus className="w-4 h-4" />}>
          Nouvelle conversation
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
        {isLoading ? (
          <div className="p-2 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" className="h-16" />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-secondary-100 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-secondary-400" />
            </div>
            <h3 className="text-secondary-700 font-medium text-sm">Aucune conversation</h3>
            <p className="text-secondary-500 text-xs mt-1">Commencez une nouvelle discussion</p>
            <Button onClick={onNewChat} className="mt-4 lg:hidden" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Nouvelle conversation
            </Button>
          </div>
        ) : (
          <ul className="space-y-1">
            {chats.map((chat) => (
              <li key={chat.id} className="relative">
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className={cn(
                    'w-full p-3 text-left rounded-xl transition-colors duration-150 relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    currentChatId === chat.id ? 'bg-white shadow-sm ring-1 ring-secondary-200' : 'hover:bg-secondary-100/70'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      fallback={chat.title?.charAt(0) || 'C'}
                      size="sm"
                      className={cn(!currentChatId || currentChatId !== chat.id ? 'opacity-90' : '')}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={cn(
                            'font-medium text-sm truncate',
                            currentChatId === chat.id ? 'text-primary-700' : 'text-secondary-900'
                          )}
                        >
                          {chat.title || 'Nouvelle conversation'}
                        </h4>
                        <button
                          onClick={(e) => handleMenuClick(chat.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-secondary-200 text-secondary-400 hover:text-secondary-600 transition-all duration-150"
                          aria-label="Plus d'options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      {chat.last_message && (
                        <p className="text-xs text-secondary-500 truncate mt-0.5">
                          {truncate(chat.last_message, 60)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="secondary" size="sm">
                          {chat.message_count} msg
                        </Badge>
                        {chat.last_message_at && (
                          <span className="text-[10px] text-secondary-400">
                            {formatRelativeTime(chat.last_message_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {showMenu === chat.id && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 animate-fade-in">
                    <div className="glass-strong rounded-xl shadow-glass ring-1 ring-black/5 py-1 min-w-[140px]">
                      <button
                        onClick={() => {
                          onSelectChat(chat.id);
                          setShowMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-100 rounded-lg mx-1"
                        style={{ width: 'calc(100% - 0.5rem)' }}
                      >
                        Ouvrir
                      </button>
                      <button
                        onClick={(e) => handleDelete(chat.id, e)}
                        className="w-full px-3 py-2 text-left text-sm text-error-600 hover:bg-secondary-100 rounded-lg mx-1"
                        style={{ width: 'calc(100% - 0.5rem)' }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
