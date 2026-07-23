import { create } from 'zustand';
import { apiFetch, generateSessionId } from '@/lib/utils';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  quantity: number;
  image: string | null;
  selectedColor?: string | null;
  selectedSize?: string | null;
}

interface CartStore {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (
    productId: string,
    quantity?: number,
    options?: { selectedColor?: string; selectedSize?: string; price?: number }
  ) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  total: 0,
  isLoading: false,

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const data = await apiFetch('/cart');
      set({ items: data.items, total: data.total, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity = 1, options) => {
    try {
      const data = await apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          quantity,
          selectedColor: options?.selectedColor,
          selectedSize: options?.selectedSize,
          price: options?.price,
        }),
      });
      set({ items: data.items, total: data.total });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-cart'));
      }
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  },

  updateQuantity: async (id, quantity) => {
    try {
      const data = await apiFetch(`/cart/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      set({ items: data.items, total: data.total });
    } catch (error) {
      console.error('Update cart error:', error);
    }
  },

  removeItem: async (id) => {
    try {
      const data = await apiFetch(`/cart/${id}`, { method: 'DELETE' });
      set({ items: data.items, total: data.total });
    } catch (error) {
      console.error('Remove from cart error:', error);
    }
  },

  clearCart: () => set({ items: [], total: 0 }),
}));
