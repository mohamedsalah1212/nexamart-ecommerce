'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const fetchCart = useCartStore((s) => s.fetchCart);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  return <>{children}</>;
}
