'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/Tooltip';
import {
  LogOut,
  User,
  Settings,
  HelpCircle,
  MessageSquare,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Bot,
  Shield,
  Database,
  Crown,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: typeof MessageSquare;
}

const COLLAPSE_KEY = 'botmd:sidebar-collapsed';

function NavLink({
  item,
  isActive,
  onClose,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  onClose: () => void;
  collapsed: boolean;
}) {
  const link = (
    <Link
      href={item.href}
      onClick={onClose}
      aria-current={isActive ? 'page' : undefined}
      aria-label={collapsed ? item.name : undefined}
      className={cn(
        'group relative flex items-center rounded-md text-[13px] font-medium transition-colors duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        collapsed ? 'h-9 w-9 justify-center mx-auto' : 'h-9 px-2.5 gap-2.5',
        isActive ? 'text-primary-600' : 'text-secondary-600 hover:bg-secondary-900/[0.05] hover:text-secondary-900'
      )}
    >
      {isActive && (
        <span
          className={cn(
            'absolute inset-0 rounded-md bg-primary-500/10 shadow-[inset_0_0_0_1px_rgba(76,95,199,0.25)] transition-colors duration-150 ease-out'
          )}
        />
      )}
      <item.icon
        className={cn('relative w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200', !isActive && 'group-hover:scale-105')}
        aria-hidden="true"
        strokeWidth={isActive ? 2.25 : 2}
      />
      <span
        className={cn(
          'relative whitespace-nowrap transition-all duration-200 ease-out overflow-hidden',
          collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
        )}
      >
        {item.name}
      </span>
      {isActive && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-primary-500" />
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12}>
          {item.name}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(COLLAPSE_KEY) : null;
    if (stored === '1') setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      return next;
    });
  };

  const role = user?.role;

  const navigation: NavItem[] = [
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Profil', href: '/profile', icon: User },
    { name: 'Paramètres', href: '/settings', icon: Settings },
    { name: 'Aide', href: '/help', icon: HelpCircle },
  ];

  const adminNavigation: NavItem[] =
    role === 'admin' || role === 'super_admin'
      ? [
          { name: 'Administration', href: '/admin', icon: Shield },
          { name: 'Documents RAG', href: '/admin/documents', icon: Database },
        ]
      : [];

  const superAdminNavigation: NavItem[] =
    role === 'super_admin' ? [{ name: 'Vue globale', href: '/super-admin', icon: Crown }] : [];

  const isItemActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const sections: { label: string; items: NavItem[] }[] = [
    { label: '', items: navigation },
    ...(adminNavigation.length > 0 ? [{ label: 'Espace admin', items: adminNavigation }] : []),
    ...(superAdminNavigation.length > 0 ? [{ label: 'Super admin', items: superAdminNavigation }] : []),
  ];

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-secondary-900/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50 flex-shrink-0 bg-white lg:bg-secondary-50 border-r border-secondary-200 flex flex-col',
          mounted ? 'transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]' : '',
          collapsed ? 'lg:w-[64px]' : 'lg:w-56',
          'w-56',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className={cn('flex items-center h-[52px] border-b border-secondary-200/70', collapsed ? 'justify-center px-2' : 'justify-between px-3')}>
            <Link
              href="/chat"
              className={cn(
                'flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg overflow-hidden',
                collapsed && 'lg:justify-center'
              )}
            >
              <div className="w-7 h-7 rounded-md bg-primary-700 flex items-center justify-center shadow-sm flex-shrink-0">
                <Bot className="w-[18px] h-[18px] text-white" />
              </div>
              <span
                className={cn(
                  'font-semibold text-[13px] tracking-tight text-secondary-900 whitespace-nowrap transition-all duration-200',
                  collapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'
                )}
              >
                BoTMD
              </span>
            </Link>
            <button
              className={cn('lg:hidden p-2 rounded-lg hover:bg-secondary-900/[0.05] transition-colors', collapsed && 'lg:hidden')}
              onClick={onClose}
              aria-label="Fermer le menu"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <nav className={cn('flex-1 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin', collapsed ? 'px-2.5' : 'px-3')}>
            {sections.map((section, si) => (
              <div key={si} className={cn(si > 0 && 'pt-4 mt-3 border-t border-secondary-200/70')}>
                {section.label && !collapsed && (
                  <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">
                    {section.label}
                  </p>
                )}
                {section.label && collapsed && (
                  <div className="h-px w-6 bg-secondary-300 mx-auto mb-2" aria-hidden="true" />
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink key={item.name} item={item} isActive={isItemActive(item.href)} onClose={onClose} collapsed={collapsed} />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className={cn('border-t border-secondary-200/70', collapsed ? 'p-2.5' : 'p-3')}>
            {collapsed ? (
              <div className="flex flex-col items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/profile" className="rounded-full ring-2 ring-transparent hover:ring-primary-200 transition-all duration-200">
                      <Avatar src={user?.avatar_url} fallback={user?.full_name} size="sm" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    {user?.full_name}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-secondary-500 hover:text-error-600 hover:bg-error-50 transition-colors duration-150"
                      aria-label="Déconnexion"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    Déconnexion
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <>
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex items-center gap-3 px-2 py-2 mb-1 rounded-md hover:bg-secondary-900/[0.04] transition-colors duration-150"
                >
                  <Avatar src={user?.avatar_url} fallback={user?.full_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">{user?.full_name}</p>
                    <p className="text-xs text-secondary-500 truncate">{user?.email}</p>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium text-secondary-600 hover:text-error-600 hover:bg-error-50 transition-colors duration-150"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </>
            )}
          </div>

          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex items-center justify-center h-9 border-t border-secondary-200/70 text-secondary-400 hover:text-secondary-700 hover:bg-secondary-900/[0.04] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
            aria-label={collapsed ? 'Développer la barre latérale' : 'Réduire la barre latérale'}
            aria-pressed={collapsed}
          >
            {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
