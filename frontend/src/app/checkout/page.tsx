'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingBag, CheckCircle, ArrowLeft, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import { formatPrice, apiFetch } from '@/lib/utils';
import { useCartStore } from '@/store/cart';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Full address is required'),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      const result = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          city: data.city,
          address: data.address,
          notes: data.notes,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      setOrderData(result);
      setIsSuccess(true);
      clearCart();
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="pt-20 lg:pt-24">
        <div className="container-custom py-16 text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
          <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
          <Link href="/products" className="btn-primary mt-4">Start Shopping</Link>
        </div>
      </div>
    );
  }

  if (isSuccess && orderData) {
    const { order, whatsappMessage, whatsappUrl } = orderData;
    const waLink = whatsappUrl || `https://wa.me/201026134030?text=${encodeURIComponent(whatsappMessage)}`;

    return (
      <div className="pt-20 lg:pt-24">
        <div className="container-custom py-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">تم تأكيد طلبك بنجاح! 🎉</h1>
            <p className="text-gray-500 mb-6">شكراً لك، تم حفظ طلبك على الموقع ويمكنك متابعته في أي وقت.</p>

            <div className="bg-gray-50 rounded-xl p-6 text-right mb-6 space-y-2 border border-gray-100">
              <p className="text-sm font-semibold text-gray-900">رقم الطلب: <span className="text-primary-600">{order.orderId}</span></p>
              <p className="text-sm text-gray-600">إجمالي المبلغ: <strong className="text-gray-900">{formatPrice(order.total)}</strong></p>
              <p className="text-sm text-gray-600">طريقة الدفع: <strong className="text-gray-900">الدفع عند الاستلام (Cash on Delivery)</strong></p>
              <p className="text-sm text-gray-600">عنوان التوصيل: <strong className="text-gray-900">{order.customer?.city} - {order.customer?.address}</strong></p>
              <p className="text-sm text-gray-600">الاسم: <strong className="text-gray-900">{order.customer?.name} ({order.customer?.phone})</strong></p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 py-3.5 text-base"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                إرسال نسخة من الطلب للتاجر عبر الواتساب (+201026134030) (اختياري)
              </a>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Link href={`/track-order?id=${order.orderId}`} className="btn-secondary text-sm">
                  متابعة الطلب عبر الموقع
                </Link>
                <Link href="/products" className="btn-secondary text-sm">
                  متابعة التسوق
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container-custom py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/cart" className="text-sm text-gray-500 hover:text-primary-500">Cart</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-900 font-medium">Checkout</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="p-6 rounded-xl border border-gray-100 bg-white">
                <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input {...register('name')} className="input-field" placeholder="Enter your full name" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input {...register('phone')} className="input-field" placeholder="e.g. +20 100 000 0000" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input {...register('city')} className="input-field" placeholder="Enter your city" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea {...register('address')} className="input-field" rows={3} placeholder="Street, building, apartment number..." />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
                    <textarea {...register('notes')} className="input-field" rows={2} placeholder="Any special instructions..." />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-gray-100 bg-white">
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary-50 border border-primary-100">
                  <CreditCard size={24} className="text-primary-500" />
                  <div>
                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">You pay when your order arrives.</p>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5 text-base">
                {isSubmitting ? 'Placing Order...' : `Place Order — ${formatPrice(total)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 p-6 rounded-xl border border-gray-100 bg-white">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                      {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice((item.discountPrice || item.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <hr className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatPrice(total)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="font-medium text-green-600">Free</span></div>
                <hr />
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>
              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2"><Truck size={14} /> Delivery: 2-5 Business Days</div>
                <div className="flex items-center gap-2"><ShieldCheck size={14} /> You pay when your order arrives</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
