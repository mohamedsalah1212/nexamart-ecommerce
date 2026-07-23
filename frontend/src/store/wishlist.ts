import { create } from 'zustand';
import { apiFetch } from '@/lib/utils';

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  image: string | null;
}

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  removeItem: (id: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>((set) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    try {
      set({ isLoading: true });
      const data = await apiFetch('/wishlist');
      set({ items: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId) => {
    try {
      const data = await apiFetch('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      if (data.inWishlist === false) {
        set((state) => ({ items: state.items.filter(i => i.productId !== productId) }));
      } else {
        await set((state) => ({ items: state.items }));
      }
      return data.inWishlist;
    } catch {
      return false;
    }
  },

  removeItem: async (id) => {
    try {
      await apiFetch(`/wishlist/${id}`, { method: 'DELETE' });
      set((state) => ({ items: state.items.filter(i => i.id !== id) }));
    } catch (error) {
      console.error('Remove from wishlist error:', error);
    }
  },
}));
