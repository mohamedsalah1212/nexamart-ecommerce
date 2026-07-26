'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search, Heart, ShoppingBag, User, Menu, X, ChevronDown,
  Package, Phone, MapPin,
} from 'lucide-react';
import { cn, apiFetch } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useSettings } from '@/components/SettingsProvider';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const pathname = usePathname();
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);
  const searchRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    apiFetch('/categories').then(setCategories).catch(() => {});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const data = await apiFetch(`/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        setSearchResults(data.products || []);
      } catch { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (pathname.startsWith('/admin')) return null;

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
    )}>
      {/* Top bar */}
      <div className="hidden lg:block bg-navy-900 text-white text-xs">
        <div className="container-custom flex items-center justify-between h-9">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone size={12} /> {settings.contact_phone || '01026134030'}</span>
            <span className="flex items-center gap-1"><MapPin size={12} /> {settings.address || 'Cairo, Egypt'}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/track-order" className="hover:text-primary-200 transition-colors flex items-center gap-1">
              <Package size={12} /> Track Order
            </Link>
            <Link href="/contact" className="hover:text-primary-200 transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-gray-100">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              {settings.site_logo ? (
                <img src={settings.site_logo} alt={settings.site_name || 'NexaMart'} className="h-8 object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{(settings.site_name || 'NexaMart').charAt(0)}</span>
                </div>
              )}
              <span className="text-xl font-bold text-navy-900 hidden sm:block">{settings.site_name || 'NexaMart'}</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 transition-colors rounded-lg hover:bg-gray-50">
                Home
              </Link>
              <div
                className="relative"
                onMouseEnter={() => { clearTimeout(megaMenuTimeout.current); setShowMegaMenu(true); }}
                onMouseLeave={() => { megaMenuTimeout.current = setTimeout(() => setShowMegaMenu(false), 150); }}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 transition-colors rounded-lg hover:bg-gray-50">
                  Categories <ChevronDown size={14} />
                </button>
                {showMegaMenu && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-3 animate-scale-in">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium">
                          {cat.name.charAt(0)}
                        </span>
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/products" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 transition-colors rounded-lg hover:bg-gray-50">
                All Products
              </Link>
              <Link href="/flash-deals" className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                Flash Deals
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <Search size={20} />
                </button>
                {isSearchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 p-3 animate-scale-in">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products, categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        autoFocus
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <div className="mt-2 space-y-1 max-h-60 overflow-auto">
                        {searchResults.map((p: any) => (
                          <Link
                            key={p.id}
                            href={`/product/${p.slug}`}
                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                              {p.mainImage && <img src={p.mainImage} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                              <p className="text-xs text-gray-500">EGP {p.discountPrice || p.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Customer Account */}
              <Link href="/account" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" title="حسابي">
                <User size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 animate-slide-down">
          <div className="container-custom py-4 space-y-1">
            <Link href="/" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-primary-50 rounded-lg">Home</Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="block px-4 py-3 text-sm text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg">
                {cat.name}
              </Link>
            ))}
            <Link href="/products" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-primary-50 rounded-lg">All Products</Link>
            <Link href="/flash-deals" className="block px-4 py-3 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">Flash Deals</Link>
            <hr className="my-2" />
            <Link href="/track-order" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 rounded-lg">
              <Package size={16} /> Track Order
            </Link>
            <Link href="/contact" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 rounded-lg">
              <Phone size={16} /> Contact Us
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
