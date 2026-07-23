'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { cn, formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, total, isLoading, fetchCart, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    const unsub = useCartStore.subscribe((state) => {
      if (state.items.length > 0 || state.total > 0) {
        // Cart changed - could trigger drawer open
      }
    });
    return () => unsub();
  }, []);

  // Listen for cart button click
  useEffect(() => {
    const handleCartClick = () => setIsOpen(true);
    window.addEventListener('open-cart', handleCartClick);
    return () => window.removeEventListener('open-cart', handleCartClick);
  }, []);

  // Override the cart button in navbar
  useEffect(() => {
    const cartButtons = document.querySelectorAll('[data-cart-toggle]');
    cartButtons.forEach(btn => {
      btn.addEventListener('click', () => setIsOpen(true));
    });
  }, []);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        'fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-primary-500" />
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <span className="text-sm text-gray-500">({items.length})</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-gray-100">
                    <Link href={`/product/${item.slug}`} className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.slug}`} className="text-sm font-medium text-gray-900 hover:text-primary-500 line-clamp-2">
                        {item.name}
                      </Link>
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedColor && (
                            <span className="text-[10px] bg-primary-50 text-primary-700 font-semibold px-2 py-0.5 rounded-md">
                              اللون: {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="text-[10px] bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded-md">
                              المقاس: {item.selectedSize}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-sm font-semibold text-primary-500 mt-1">
                        {formatPrice(item.discountPrice || item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-gray-500">Delivery: 2-5 Business Days • Cash on Delivery</p>
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="btn-primary w-full"
              >
                Proceed to Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
