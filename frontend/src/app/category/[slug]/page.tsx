'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import { ProductCard } from '@/components/product/ProductCard';

export default function CategoryPage() {
  const params = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [catData, prodData] = await Promise.all([
          apiFetch(`/categories/${params.slug}`),
          apiFetch(`/products?category=${params.slug}&limit=50`),
        ]);
        setCategory(catData);
        setProducts(prodData.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params.slug]);

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container-custom py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-500">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{category?.name || 'Category'}</span>
        </nav>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="skeleton aspect-square" />
                <div className="p-4 space-y-2"><div className="skeleton h-3 w-3/4" /><div className="skeleton h-4 w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold">{category?.name}</h1>
              {category?.description && <p className="text-gray-500 mt-2">{category.description}</p>}
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 text-gray-500">No products in this category yet.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
