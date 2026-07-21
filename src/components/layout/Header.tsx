'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Menu, Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { useAuthStore } from '@/stores/authStore';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 glass border-b border-secondary-200/80">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            onClick={onMenuClick}
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Rechercher…"
              aria-label="Rechercher dans l'aide"
              className="w-full pl-10 pr-4 py-2 bg-secondary-100/80 border border-transparent rounded-full text-sm text-secondary-900 placeholder:text-secondary-400 transition-all duration-200 ease-out focus:outline-none focus:bg-white focus:border-secondary-200 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-error-500 rounded-full ring-2 ring-white" />
          </Button>

          <div className="w-px h-6 bg-secondary-200 mx-1 hidden sm:block" aria-hidden="true" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-transform duration-150 ease-out hover:scale-105"
                aria-label="Menu utilisateur"
              >
                <Avatar src={user?.avatar_url} fallback={user?.full_name} size="sm" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <div className="px-4 py-2.5 border-b border-secondary-200/80">
                <p className="font-medium text-sm text-secondary-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-secondary-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex w-full items-center gap-2.5 text-sm">
                    <User className="w-4 h-4 text-secondary-500" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex w-full items-center gap-2.5 text-sm">
                    <Settings className="w-4 h-4 text-secondary-500" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <div className="py-1">
                <DropdownMenuItem onClick={logout} className="text-error-600 focus:text-error-600 gap-2.5">
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
