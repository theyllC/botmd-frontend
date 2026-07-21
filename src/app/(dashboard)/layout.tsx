'use client';

import { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isChatRoute = pathname?.startsWith('/chat');

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      <button
        className="lg:hidden fixed bottom-5 right-5 z-40 bg-primary-500 text-white p-3.5 rounded-full shadow-lg shadow-primary-500/30 transition-transform duration-200 ease-out active:scale-95"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Ouvrir le menu de navigation"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-0 flex flex-col min-w-0">
        {!isChatRoute && <Header onMenuClick={() => setSidebarOpen(true)} />}
        <main
          className={cn(
            isChatRoute ? 'flex-1 min-h-0 flex flex-col overflow-hidden' : 'flex-1 p-4 lg:p-8 overflow-auto'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
