'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Trash2, Minus, Plus, ArrowLeft, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';

export default function CartPage() {
  const { items, total, isLoading, updateQuantity, removeItem } = useCartStore();
  const router = useRouter();

  const shipping = 0; // Free shipping
  const grandTotal = total + shipping;

  if (items.length === 0) {
    return (
      <div className="pt-20 lg:pt-24">
        <div className="container-custom py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/products" className="btn-primary">Start Shopping</Link>
          </div>
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
          <span className="text-sm text-gray-900 font-medium">Cart</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-8">Shopping Cart ({items.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-white">
                <Link href={`/product/${item.slug}`} className="w-24 h-24 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100" />}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.slug}`} className="text-sm font-medium text-gray-900 hover:text-primary-500 line-clamp-2">
                    {item.name}
                  </Link>
                  <p className="text-sm font-semibold text-primary-500 mt-1">{formatPrice(item.discountPrice || item.price)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-gray-50">
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-50">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatPrice((item.discountPrice || item.price) * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 p-6 rounded-xl border border-gray-100 bg-white">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium">Cash on Delivery</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2"><Truck size={14} /> Estimated Delivery: 2-5 Business Days</div>
                <div className="flex items-center gap-2"><ShieldCheck size={14} /> Secure checkout</div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="btn-primary w-full mt-6"
              >
                Proceed to Checkout
              </button>
              <Link href="/products" className="btn-secondary w-full mt-3 flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
