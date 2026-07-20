'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { LogOut, User, Settings, HelpCircle, MessageSquare, ChevronLeft, Bot, Shield, Database, Crown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const role = user?.role;

  const navigation = [
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Profil', href: '/profile', icon: User },
    { name: 'Paramètres', href: '/settings', icon: Settings },
    { name: 'Aide', href: '/help', icon: HelpCircle },
  ];

  const adminNavigation = role === 'admin' || role === 'super_admin'
    ? [
        { name: 'Administration', href: '/admin', icon: Shield },
        { name: 'Documents RAG', href: '/admin/documents', icon: Database },
      ]
    : [];

  const superAdminNavigation = role === 'super_admin'
    ? [{ name: 'Vue globale', href: '/super-admin', icon: Crown }]
    : [];

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-secondary-200 transform transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-200">
            <Link href="/chat" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-semibold text-secondary-900">BoTMD</span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-secondary-100"
              onClick={onClose}
              aria-label="Fermer le menu"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                  )}
                  onClick={onClose}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}

            {adminNavigation.length > 0 && (
              <div className="pt-4 mt-2 border-t border-secondary-100">
                <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wide text-secondary-400">
                  Espace admin
                </p>
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                      )}
                      onClick={onClose}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}

            {superAdminNavigation.length > 0 && (
              <div className="pt-4 mt-2 border-t border-secondary-100">
                <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wide text-secondary-400">
                  Super admin
                </p>
                {superAdminNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                      )}
                      onClick={onClose}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-secondary-200">
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                src={user?.avatar_url}
                fallback={user?.full_name}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-secondary-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-secondary-600 hover:text-error-600 hover:bg-error-50"
              onClick={() => { logout(); onClose(); }}
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}