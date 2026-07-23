'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, Quote, Sparkles, Zap, Box, Cpu, UtensilsCrossed } from 'lucide-react';
import { apiFetch, cn } from '@/lib/utils';
import { HeroSlider } from '@/components/home/HeroSlider';
import { ProductCard, ProductGrid } from '@/components/product/ProductCard';

const categoryIcons: Record<string, any> = {
  'home-gadgets': Zap,
  'kitchen-accessories': UtensilsCrossed,
  'home-organizers': Box,
  'smart-everyday-products': Cpu,
  'lifestyle-accessories': Sparkles,
};

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [flashDeals, setFlashDeals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [featuredData, trendingData, bestSellersData, flashData, cats] = await Promise.all([
          apiFetch('/products?featured=true&limit=10'),
          apiFetch('/products?trending=true&limit=10'),
          apiFetch('/products?bestSeller=true&limit=10'),
          apiFetch('/products?flashDeal=true&limit=8'),
          apiFetch('/categories'),
        ]);
        setFeatured(featuredData.products || []);
        setTrending(trendingData.products || []);
        setBestSellers(bestSellersData.products || []);
        setFlashDeals(flashData.products || []);
        setCategories(cats || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container-custom">
        <HeroSlider />
      </div>

      {/* Promo Banners */}
      <section className="container-custom mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 p-6 text-white">
            <h3 className="text-lg font-bold">Free Delivery</h3>
            <p className="mt-1 text-primary-100 text-sm">On all orders across Egypt</p>
            <TruckIcon className="absolute right-4 bottom-4 opacity-20" size={48} />
          </div>
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-navy-700 to-navy-900 p-6 text-white">
            <h3 className="text-lg font-bold">Cash on Delivery</h3>
            <p className="mt-1 text-navy-300 text-sm">Pay when your order arrives</p>
            <WalletIcon className="absolute right-4 bottom-4 opacity-20" size={48} />
          </div>
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white">
            <h3 className="text-lg font-bold">Easy Returns</h3>
            <p className="mt-1 text-gray-400 text-sm">30-day hassle-free returns</p>
            <RefreshIcon className="absolute right-4 bottom-4 opacity-20" size={48} />
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-custom mt-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Explore our curated collections</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center p-6 rounded-xl border border-gray-100 bg-white hover:shadow-md hover:border-primary-100 transition-all duration-200"
              >
                <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-200">
                  <span className="text-xl font-bold">{cat.name.charAt(0)}</span>
                </div>
                <span className="mt-3 text-sm font-medium text-gray-900 group-hover:text-primary-500 transition-colors text-center">
                  {cat.name}
                </span>
                <span className="mt-1 text-xs text-gray-400">{cat._count?.products || 0} products</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Flash Deals */}
      {flashDeals.length > 0 && (
        <section className="container-custom mt-12">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Flash Deals</h2>
                <p className="text-sm text-gray-500">Limited time offers — grab them before they're gone!</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flashDeals.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="container-custom mt-12">
          <ProductGrid products={featured} title="Featured Products" subtitle="Hand-picked just for you" />
        </section>
      )}

      {/* Trending Products */}
      {trending.length > 0 && (
        <section className="container-custom mt-12">
          <ProductGrid products={trending} title="Trending Now" subtitle="Most popular products this week" />
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="container-custom mt-12">
          <ProductGrid products={bestSellers} title="Best Sellers" subtitle="Top-rated products loved by customers" />
        </section>
      )}

      {/* Testimonials */}
      <section className="container-custom mt-12 mb-12">
        <div className="text-center mb-8">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Join thousands of happy customers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Sarah M.', text: 'Amazing quality products! The delivery was super fast and the items were exactly as described.', rating: 5 },
            { name: 'Ahmed K.', text: 'Great shopping experience. The cash on delivery option makes it so convenient.', rating: 5 },
            { name: 'Mona L.', text: 'I love my new kitchen gadgets! Will definitely be ordering again.', rating: 5 },
          ].map((testimonial, i) => (
            <div key={i} className="p-6 rounded-xl border border-gray-100 bg-white">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <Quote size={20} className="text-primary-200 mb-2" />
              <p className="text-gray-600 text-sm leading-relaxed">{testimonial.text}</p>
              <p className="mt-4 font-medium text-gray-900 text-sm">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TruckIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
      <path d="M16 17h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-2" />
      <path d="M16 5h2a2 2 0 0 1 2 2v1" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="16" cy="17" r="2" />
    </svg>
  );
}

function WalletIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function RefreshIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21h5v-5" />
    </svg>
  );
}
