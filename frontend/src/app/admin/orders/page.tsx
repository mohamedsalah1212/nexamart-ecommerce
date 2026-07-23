'use client';

import { useState, useEffect } from 'react';
import { Search, Phone, MessageSquare, ChevronDown, CheckCircle, XCircle, Clock, Package, Truck } from 'lucide-react';
import { cn, formatPrice, apiFetch } from '@/lib/utils';

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const loadOrders = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      const data = await apiFetch(`/orders?${params}`);
      setOrders(data.orders || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      loadOrders(pagination.page);
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatusFilter('')}
          className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', !statusFilter ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
          All
        </button>
        {statuses.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors', statusFilter === s ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Items</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Total</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={cn('border-b border-gray-50 cursor-pointer transition-colors', selectedOrder?.id === order.id ? 'bg-primary-50' : 'hover:bg-gray-50')}>
                    <td className="py-3 px-4 font-medium text-primary-500 text-xs">#{order.orderId}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{order.customer?.name}</p>
                      <p className="text-xs text-gray-500">{order.customer?.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{order.items?.length || 0} items</td>
                    <td className="py-3 px-4 font-medium">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4">
                      <span className={cn('badge text-xs capitalize', getStatusColor(order.status))}>{order.status}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Order #{selectedOrder.orderId}</h2>

              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Customer</h3>
                <p className="text-sm font-medium">{selectedOrder.customer?.name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.customer?.phone}</p>
                <p className="text-sm text-gray-500">{selectedOrder.customer?.city}, {selectedOrder.customer?.address}</p>
              </div>

              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name} × {item.quantity}</span>
                      <span className="font-medium">EGP {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Status</h3>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                  className="input-field"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <a href={`tel:${selectedOrder.customer?.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
                  <Phone size={14} /> Call
                </a>
                <a href={`https://wa.me/${selectedOrder.customer?.phone?.replace(/[^0-9]/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
                  <MessageSquare size={14} /> WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button key={i} onClick={() => loadOrders(i + 1)}
              className={cn('w-8 h-8 rounded text-sm font-medium', pagination.page === i + 1 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700',
    confirmed: 'bg-blue-50 text-blue-700',
    processing: 'bg-indigo-50 text-indigo-700',
    shipped: 'bg-purple-50 text-purple-700',
    delivered: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
  };
  return colors[status] || 'bg-gray-50 text-gray-700';
}
