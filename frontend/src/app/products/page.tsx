'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, Grid3X3, List, ChevronDown } from 'lucide-react';
import { cn, apiFetch } from '@/lib/utils';
import { ProductCard } from '@/components/product/ProductCard';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  const loadProducts = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      params.set('sort', sort);
      if (selectedCategory) params.set('category', selectedCategory);
      if (searchParams.get('search')) params.set('search', searchParams.get('search')!);

      const data = await apiFetch(`/products?${params.toString()}`);
      setProducts(data.products || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    apiFetch('/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    loadProducts(1);
  }, [sort, selectedCategory]);

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary-500">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">All Products</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">All Products</h1>
            <p className="text-sm text-gray-500 mt-1">{pagination.total} products found</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className="btn-ghost flex items-center gap-2 lg:hidden">
              <SlidersHorizontal size={16} /> Filters
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-primary-500">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
              <option value="name_desc">Name: Z-A</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={cn(
            'w-64 flex-shrink-0 space-y-6',
            showFilters ? 'block' : 'hidden lg:block'
          )}>
            <div>
              <h3 className="font-semibold text-sm mb-3">Categories</h3>
              <div className="space-y-1">
                <button onClick={() => setSelectedCategory('')}
                  className={cn('block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                    !selectedCategory ? 'bg-primary-50 text-primary-500 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  )}>
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.slug)}
                    className={cn('block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                      selectedCategory === cat.slug ? 'bg-primary-50 text-primary-500 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    )}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="skeleton aspect-square" />
                    <div className="p-4 space-y-2">
                      <div className="skeleton h-3 w-3/4" />
                      <div className="skeleton h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">No products found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {Array.from({ length: pagination.pages }).map((_, i) => (
                      <button key={i} onClick={() => loadProducts(i + 1)}
                        className={cn(
                          'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                          pagination.page === i + 1 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="pt-24 text-center py-12">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

