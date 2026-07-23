'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, ShoppingBag, Phone, MapPin, Mail, LogOut, CheckCircle, Package, Clock, ShieldCheck } from 'lucide-react';
import { apiFetch, formatPrice } from '@/lib/utils';

export default function AccountPage() {
  const [customer, setCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regAddress, setRegAddress] = useState('');

  useEffect(() => {
    const savedCustomer = localStorage.getItem('customer_info');
    if (savedCustomer) {
      try {
        const parsed = JSON.parse(savedCustomer);
        setCustomer(parsed);
        loadCustomerProfile(parsed.id);
      } catch {}
    }
  }, []);

  const loadCustomerProfile = async (customerId: string) => {
    try {
      const data = await apiFetch('/auth/customer/me', {
        method: 'POST',
        body: JSON.stringify({ customerId }),
      });
      setCustomer(data);
      localStorage.setItem('customer_info', JSON.stringify(data));
    } catch {}
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await apiFetch('/auth/customer/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      localStorage.setItem('customer_token', data.token);
      localStorage.setItem('customer_info', JSON.stringify(data.customer));
      setCustomer(data.customer);
      loadCustomerProfile(data.customer.id);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await apiFetch('/auth/customer/register', {
        method: 'POST',
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
          city: regCity,
          address: regAddress,
        }),
      });
      localStorage.setItem('customer_token', data.token);
      localStorage.setItem('customer_info', JSON.stringify(data.customer));
      setCustomer(data.customer);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_info');
    setCustomer(null);
  };

  if (!customer) {
    return (
      <div className="pt-20 lg:pt-24">
        <div className="container-custom py-12">
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-3">
                <User size={24} />
              </div>
              <h1 className="text-2xl font-bold">حسابي في NexaMart</h1>
              <p className="text-sm text-gray-500 mt-1">قم بتسجيل الدخول لمتابعة طلباتك وتصفح حسابك</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-6">
              <button
                onClick={() => { setActiveTab('login'); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'login' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => { setActiveTab('register'); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'register' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                إنشاء حساب جديد
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-xs text-center border border-red-100">
                {error}
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="input-field"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">كلمة المرور</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
                  {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">الاسم بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="input-field"
                    placeholder="الاسم الثلاثي"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="input-field"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">كلمة المرور *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="input-field"
                    placeholder="6 أحرف على الأقل"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="input-field"
                    placeholder="01000000000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">المدينة</label>
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="input-field"
                      placeholder="القاهرة"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">العنوان التفصيلي</label>
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="input-field"
                      placeholder="الشارع، المبنى"
                    />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
                  {isLoading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-500 font-bold text-xl flex items-center justify-center">
                {customer.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{customer.name}</h1>
                <p className="text-xs text-gray-500">{customer.email || customer.phone}</p>
                {customer.city && <p className="text-xs text-gray-400 mt-0.5">{customer.city} - {customer.address}</p>}
              </div>
            </div>
            <button onClick={handleLogout} className="btn-secondary text-xs flex items-center gap-2 text-red-600 hover:bg-red-50">
              <LogOut size={14} /> تسجيل الخروج
            </button>
          </div>

          {/* Orders Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag size={20} className="text-primary-500" />
              طلباتي ({customer.orders?.length || 0})
            </h2>

            {!customer.orders || customer.orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <Package size={48} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-500 text-sm">لم تقم بإجراء أي طلبات حتى الآن.</p>
                <Link href="/products" className="btn-primary mt-4 inline-flex text-xs">تصفح المنتجات وابدأ التسوق</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {customer.orders.map((order: any) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Order Card with inline tracking ────────────────────────────────────────

const STATUS_STEPS = [
  { key: 'pending',    labelAr: 'تم الاستلام',   icon: '🕐' },
  { key: 'confirmed',  labelAr: 'تم التأكيد',    icon: '✅' },
  { key: 'processing', labelAr: 'جاري التجهيز',  icon: '📦' },
  { key: 'shipped',    labelAr: 'في الطريق',     icon: '🚚' },
  { key: 'delivered',  labelAr: 'تم التوصيل',    icon: '🎉' },
];

const STATUS_BADGE: Record<string, { bg: string; text: string; labelAr: string }> = {
  pending:    { bg: 'bg-yellow-50', text: 'text-yellow-700', labelAr: 'قيد الانتظار' },
  confirmed:  { bg: 'bg-blue-50',   text: 'text-blue-700',   labelAr: 'تم التأكيد' },
  processing: { bg: 'bg-indigo-50', text: 'text-indigo-700', labelAr: 'جاري التجهيز' },
  shipped:    { bg: 'bg-purple-50', text: 'text-purple-700', labelAr: 'تم الشحن' },
  delivered:  { bg: 'bg-green-50',  text: 'text-green-700',  labelAr: 'تم التوصيل' },
  cancelled:  { bg: 'bg-red-50',    text: 'text-red-700',    labelAr: 'ملغي' },
};

function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);
  const badge = STATUS_BADGE[order.status] || { bg: 'bg-gray-50', text: 'text-gray-700', labelAr: order.status };
  const currentStep = STATUS_STEPS.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
      {/* Header — click to expand */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full text-right p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-gray-50/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${badge.bg}`}>
            {isCancelled ? '❌' : STATUS_STEPS[Math.max(0, currentStep)]?.icon}
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">#{order.orderId}</p>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${badge.bg} ${badge.text}`}>
            {badge.labelAr}
          </span>
          <span className="text-gray-400 text-xs">{expanded ? '▲ إخفاء' : '▼ تفاصيل الطلب'}</span>
        </div>
      </button>

      {/* Expandable details */}
      {expanded && (
        <div className="border-t border-gray-50 px-5 pb-5 space-y-5">
          {/* Progress Timeline */}
          {!isCancelled && (
            <div className="pt-4">
              <p className="text-xs font-semibold text-gray-500 mb-3">حالة الطلب</p>
              <div className="flex items-start gap-0">
                {STATUS_STEPS.map((step, i) => {
                  const done  = i <= currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center">
                      {/* connector line + circle */}
                      <div className="flex items-center w-full">
                        {i > 0 && <div className={`flex-1 h-0.5 ${i <= currentStep ? 'bg-primary-400' : 'bg-gray-200'}`} />}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 flex-shrink-0 transition-all ${
                          active  ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-100 scale-110' :
                          done    ? 'border-primary-400 bg-primary-400 text-white' :
                                    'border-gray-200 bg-white text-gray-300'
                        }`}>
                          {done && !active ? '✓' : step.icon}
                        </div>
                        {i < STATUS_STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-primary-400' : 'bg-gray-200'}`} />}
                      </div>
                      <p className={`text-[10px] mt-1.5 text-center font-medium leading-tight ${done ? 'text-primary-600' : 'text-gray-400'}`}>
                        {step.labelAr}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="p-3 bg-red-50 rounded-xl text-xs text-red-600 font-medium text-center mt-3">
              ❌ تم إلغاء هذا الطلب
            </div>
          )}

          {/* Items with thumbnails */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-3">المنتجات المطلوبة</p>
            <div className="space-y-1">
              {order.items?.map((item: any, i: number) => {
                const imageUrl = item.product?.images?.[0]?.url || null;
                const slug = item.product?.slug || null;
                const content = (
                  <div className="flex items-center gap-3 group p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold text-gray-800 truncate ${slug ? 'group-hover:text-primary-600 transition-colors' : ''}`}>
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">الكمية: {item.quantity}</p>
                      {slug && <p className="text-[10px] text-primary-400 mt-0.5">اضغط لمشاهدة المنتج ←</p>}
                    </div>
                    {/* Price */}
                    <span className="text-xs font-bold text-gray-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                );
                return (
                  <div key={i}>
                    {slug ? <Link href={`/product/${slug}`}>{content}</Link> : content}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">الإجمالي</span>
              <span className="text-sm font-bold text-primary-600">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <a
              href={`https://wa.me/201026134030?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن طلبي رقم #${order.orderId}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              تواصل مع التاجر
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

