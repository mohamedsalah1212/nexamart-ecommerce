'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, CheckCircle, X } from 'lucide-react';
import { apiFetch } from '@/lib/utils';

const CITIES = ['Cairo', 'Alexandria', 'Giza', 'Mansoura', 'Tanta', 'Zagazig', 'Hurghada', 'Sharm El Sheikh'];
const NAMES = ['Ahmed M.', 'Sara K.', 'Mohamed A.', 'Nour H.', 'Mariam T.', 'Omar S.', 'Youssef N.', 'Heba F.'];
const TIMES = ['2 minutes ago', '5 minutes ago', '1 minute ago', 'just now', '8 minutes ago', '12 minutes ago'];

export function RecentSalesPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSale, setCurrentSale] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch products to use in sales notifications
    apiFetch('/products?limit=10')
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    // Show popup every 12 seconds
    const interval = setInterval(() => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
      const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
      const randomTime = TIMES[Math.floor(Math.random() * TIMES.length)];

      setCurrentSale({
        product: randomProduct,
        city: randomCity,
        name: randomName,
        time: randomTime,
      });

      setIsVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }, 12000);

    // Initial popup trigger after 3 seconds
    const initialTimer = setTimeout(() => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
      const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
      const randomTime = TIMES[Math.floor(Math.random() * TIMES.length)];

      setCurrentSale({
        product: randomProduct,
        city: randomCity,
        name: randomName,
        time: randomTime,
      });
      setIsVisible(true);

      setTimeout(() => setIsVisible(false), 5000);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, [products]);

  if (!isVisible || !currentSale) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm bg-white rounded-2xl p-3.5 shadow-2xl border border-gray-100 flex items-center gap-3.5 animate-slide-up transition-all duration-300">
      <Link href={`/product/${currentSale.product.slug}`} className="relative w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
        {currentSale.product.mainImage ? (
          <img src={currentSale.product.mainImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary-500 bg-primary-50">
            <ShoppingBag size={20} />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1 text-[11px] font-medium text-green-600 mb-0.5">
          <CheckCircle size={12} className="fill-green-600 text-white" />
          <span>Verified Purchase</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-400">{currentSale.time}</span>
        </div>
        <p className="text-xs font-semibold text-gray-900 truncate">
          {currentSale.name} <span className="font-normal text-gray-500">from {currentSale.city}</span>
        </p>
        <Link href={`/product/${currentSale.product.slug}`} className="text-xs text-primary-600 hover:underline line-clamp-1 font-medium mt-0.5">
          Purchased {currentSale.product.name}
        </Link>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
