'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, Search, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { apiFetch } from '@/lib/utils';

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-500 bg-yellow-50', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-blue-500 bg-blue-50', label: 'Confirmed' },
  processing: { icon: Package, color: 'text-indigo-500 bg-indigo-50', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-purple-500 bg-purple-50', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-500 bg-green-50', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-500 bg-red-50', label: 'Cancelled' },
};

const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [orderId, setOrderId] = useState(initialId);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrder = async (idToFetch: string) => {
    if (!idToFetch.trim()) return;
    setIsLoading(true);
    setError('');
    setOrder(null);
    try {
      const data = await apiFetch(`/orders/track/${idToFetch.trim()}`);
      setOrder(data);
    } catch {
      setError('Order not found. Please check your order ID.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchOrder(initialId);
    }
  }, [initialId]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderId);
  };

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Package size={48} className="mx-auto text-primary-500 mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold">Track Your Order</h1>
            <p className="text-gray-500 mt-2">Enter your order ID to check the status in real-time.</p>
          </div>

          <form onSubmit={handleTrack} className="flex gap-3 mb-8">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter Order ID (e.g. ORD-...)"
              className="input-field flex-1"
            />
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
          )}

          {order && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-lg">Order #{order.orderId}</h2>
                    <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString('en-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className={cn('px-3 py-1.5 rounded-lg text-sm font-medium', statusConfig[order.status]?.color || 'bg-gray-50 text-gray-500')}>
                    {statusConfig[order.status]?.label || order.status}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    {statusOrder.map((status, i) => {
                      const currentIdx = statusOrder.indexOf(order.status);
                      const isCompleted = i <= currentIdx;
                      const isCancelled = order.status === 'cancelled';
                      const StatusIcon = statusConfig[status]?.icon || Clock;
                      return (
                        <div key={status} className="flex flex-col items-center relative">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2',
                            isCancelled ? 'border-red-200 bg-red-50 text-red-400' :
                            isCompleted ? 'border-primary-500 bg-primary-50 text-primary-500' : 'border-gray-200 bg-gray-50 text-gray-300'
                          )}>
                            <StatusIcon size={16} />
                          </div>
                          <p className={cn('text-xs mt-1 font-medium', isCompleted ? 'text-primary-500' : 'text-gray-400')}>{statusConfig[status]?.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 rounded-xl border border-gray-100 bg-white">
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name} × {item.quantity}</span>
                      <span className="font-medium">EGP {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <hr className="my-3" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>EGP {order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 text-sm text-primary-700">
                <strong>Payment:</strong> Cash on Delivery — You pay when your order arrives.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="pt-24 text-center py-12">Loading order tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}

function cn(...classes: any[]) { return classes.filter(Boolean).join(' '); }
