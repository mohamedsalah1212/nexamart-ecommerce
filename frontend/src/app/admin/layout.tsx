'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, ShoppingBag, Package, Image, MessageSquare,
  Settings, LogOut, Menu, X, Bell, ChevronDown, ListOrdered,
  BarChart3, Users, Star,
} from 'lucide-react';
import { cn, apiFetch } from '@/lib/utils';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: ListOrdered },
  { href: '/admin/banners', label: 'Banners', icon: Image },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      if (pathname !== '/admin/login') router.push('/admin/login');
      setIsLoading(false);
      return;
    }
    apiFetch('/auth/me')
      .then((data) => { setAdmin(data); setIsAuthenticated(true); })
      .catch(() => { localStorage.removeItem('admin_token'); router.push('/admin/login'); })
      .finally(() => setIsLoading(false));
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(async () => {
      try {
        const data = await apiFetch('/orders/dashboard');
        setUnreadNotifs(data.unreadNotifications || 0);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-navy-900 text-white z-50 transition-transform duration-300',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-navy-700">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="font-bold">NexaMart Admin</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 hover:bg-navy-800 rounded">
            <X size={18} />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-primary-500 text-white' : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                )}>
                <link.icon size={18} />
                {link.label}
                {link.href === '/admin/orders' && unreadNotifs > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifs}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-navy-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-sm font-bold">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{admin?.name}</p>
              <p className="text-xs text-navy-400 truncate">{admin?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 hover:bg-navy-800 rounded text-navy-400 hover:text-white transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 h-16">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3 ml-auto">
              <Link href="/" className="text-sm text-gray-500 hover:text-primary-500">View Store</Link>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
