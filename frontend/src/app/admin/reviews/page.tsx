'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2, Star } from 'lucide-react';
import { cn, apiFetch } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = async () => {
    try {
      const data = await apiFetch('/reviews/all/admin');
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, []);

  const approve = async (id: string) => {
    try { await apiFetch(`/reviews/${id}/approve`, { method: 'PUT' }); loadReviews(); } catch {}
  };

  const hide = async (id: string) => {
    try { await apiFetch(`/reviews/${id}/hide`, { method: 'PUT' }); loadReviews(); } catch {}
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try { await apiFetch(`/reviews/${id}`, { method: 'DELETE' }); loadReviews(); } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">{reviews.length} total reviews</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Product</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Customer</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Rating</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Comment</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{r.product?.name}</td>
                  <td className="py-3 px-4 text-gray-600">{r.customerName}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">{r.comment || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={cn('badge text-xs', r.isApproved ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700')}>
                      {r.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!r.isApproved && (
                        <button onClick={() => approve(r.id)} className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {r.isApproved && (
                        <button onClick={() => hide(r.id)} className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded">
                          <XCircle size={14} />
                        </button>
                      )}
                      <button onClick={() => deleteReview(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
