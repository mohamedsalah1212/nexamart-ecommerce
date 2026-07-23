'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Eye, ChevronRight } from 'lucide-react';
import { cn, formatPrice, apiFetch } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';

interface ProductCardProps {
  product: any;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const wishlistItems = useWishlistStore((s) => s.items);

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  useEffect(() => {
    setIsInWishlist(wishlistItems.some(i => i.productId === product.id));
  }, [wishlistItems, product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    setIsInWishlist(!isInWishlist);
  };

  return (
    <div
      className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {hasDiscount && <span className="badge-sale">-{discountPercent}%</span>}
        {product.isFlashDeal && <span className="badge bg-orange-50 text-orange-700">Flash Deal</span>}
      </div>

      <button
        onClick={handleToggleWishlist}
        className={cn(
          'absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
          isInWishlist ? 'bg-red-50 text-red-500' : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-white'
        )}
      >
        <Heart size={16} className={cn(isInWishlist && 'fill-red-500')} />
      </button>

      <Link href={`/product/${product.slug}`} className="block aspect-square bg-gray-50 relative overflow-hidden">
        {product.mainImage ? (
          <img
            src={product.mainImage}
            alt={product.name}
            className={cn('w-full h-full object-cover transition-all duration-500', isHovered && 'scale-105')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Eye size={48} />
          </div>
        )}
      </Link>

      <div className="p-4">
        {product.category && (
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{product.category.name}</p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-500 transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {product.avgRating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-500">{product.avgRating}</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-gray-900">
            {formatPrice(product.discountPrice || product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <span>🚚</span>
          <span>{product.deliveryTime || '2-5 Business Days'}</span>
        </div>

        <button
          onClick={handleAddToCart}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          <ShoppingBag size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export function ProductGrid({ products, title, subtitle }: { products: any[]; title?: string; subtitle?: string }) {
  return (
    <section>
      {title && (
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600">
            View All <ChevronRight size={16} />
          </Link>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
