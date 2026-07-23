'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Package, Users, DollarSign, TrendingUp,
  Clock, CheckCircle, Truck, XCircle, Eye,
} from 'lucide-react';
import { cn, formatPrice, apiFetch } from '@/lib/utils';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch('/orders/dashboard')
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-80 rounded-xl" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const ordersByStatus = data?.ordersByStatus || [];
  const recentOrders = data?.recentOrders || [];
  const revenueChart = data?.revenueChart || [];
  const notifications = data?.notifications || [];

  const statusCounts: Record<string, number> = {};
  ordersByStatus.forEach((s: any) => { statusCounts[s.status] = s._count; });

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue || 0), icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Total Customers', value: stats.totalCustomers || 0, icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Products', value: stats.totalProducts || 0, icon: Package, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', card.color)}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders by Status & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {[
              { status: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-500' },
              { status: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'text-blue-500' },
              { status: 'processing', label: 'Processing', icon: Package, color: 'text-indigo-500' },
              { status: 'shipped', label: 'Shipped', icon: Truck, color: 'text-purple-500' },
              { status: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'text-green-500' },
              { status: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-500' },
            ].map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <s.icon size={16} className={s.color} />
                  <span className="text-sm text-gray-600">{s.label}</span>
                </div>
                <span className="text-sm font-semibold">{statusCounts[s.status] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary-500 hover:text-primary-600">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Order</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Customer</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Total</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-primary-500">#{order.orderId.slice(0, 12)}...</td>
                    <td className="py-3 px-2">{order.customer?.name}</td>
                    <td className="py-3 px-2 font-medium">{formatPrice(order.total)}</td>
                    <td className="py-3 px-2">
                      <span className={cn(
                        'badge text-xs',
                        order.status === 'pending' && 'bg-yellow-50 text-yellow-700',
                        order.status === 'confirmed' && 'bg-blue-50 text-blue-700',
                        order.status === 'processing' && 'bg-indigo-50 text-indigo-700',
                        order.status === 'shipped' && 'bg-purple-50 text-purple-700',
                        order.status === 'delivered' && 'bg-green-50 text-green-700',
                        order.status === 'cancelled' && 'bg-red-50 text-red-700',
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Revenue (Last 30 Days)</h2>
        <div className="h-48 flex items-end gap-1">
          {revenueChart.map((day: any, i: number) => {
            const maxRevenue = Math.max(...revenueChart.map((d: any) => d.revenue), 1);
            const height = (day.revenue / maxRevenue) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="absolute bottom-full mb-1 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                  EGP {day.revenue.toFixed(0)}
                </div>
                <div
                  className="w-full rounded-t bg-primary-500/80 hover:bg-primary-500 transition-colors"
                  style={{ height: `${Math.max(height, 1)}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Notifications</h2>
          <div className="space-y-2">
            {notifications.slice(0, 5).map((n: any) => (
              <div key={n.id} className={cn('flex items-center gap-3 p-3 rounded-lg text-sm', n.isRead ? 'text-gray-500' : 'bg-primary-50 text-gray-900 font-medium')}>
                <div className={cn('w-2 h-2 rounded-full', n.isRead ? 'bg-gray-300' : 'bg-primary-500')} />
                {n.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
