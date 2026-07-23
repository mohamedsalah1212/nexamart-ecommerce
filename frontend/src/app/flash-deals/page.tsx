'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import { ProductCard } from '@/components/product/ProductCard';

export default function FlashDealsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch('/products?flashDeal=true&limit=50')
      .then((data) => setProducts(data.products || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container-custom py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
            <span className="text-white text-2xl">⚡</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Flash Deals</h1>
            <p className="text-gray-500">Limited time offers — grab them before they're gone!</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="skeleton aspect-square" />
                <div className="p-4 space-y-2"><div className="skeleton h-3 w-3/4" /><div className="skeleton h-4 w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No flash deals available right now.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
