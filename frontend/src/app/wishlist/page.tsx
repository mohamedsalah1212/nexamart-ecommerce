'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';

export default function WishlistPage() {
  const { items, isLoading, removeItem } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart);

  if (items.length === 0) {
    return (
      <div className="pt-20 lg:pt-24">
        <div className="container-custom py-16 text-center">
          <Heart size={64} className="mx-auto text-gray-200 mb-6" />
          <h1 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h1>
          <p className="text-gray-500 mb-6">Save items you love to your wishlist.</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container-custom py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary-500">Home</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-900 font-medium">Wishlist</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-8">My Wishlist ({items.length})</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative rounded-xl border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-all">
              <Link href={`/product/${item.slug}`} className="block aspect-square bg-gray-50">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Heart size={32} /></div>}
              </Link>
              <button onClick={() => removeItem(item.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all">
                <Trash2 size={14} />
              </button>
              <div className="p-4">
                <Link href={`/product/${item.slug}`} className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-500">{item.name}</Link>
                <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(item.discountPrice || item.price)}</p>
                <button onClick={() => { addToCart(item.productId); removeItem(item.id); }}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                  <ShoppingBag size={14} /> Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
