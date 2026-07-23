'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, Package, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      {/* Newsletter */}
      <div className="border-b border-navy-700">
        <div className="container-custom py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold">Stay in the Loop</h3>
            <p className="mt-2 text-navy-300">Get exclusive deals and new arrivals straight to your inbox.</p>
            <form className="mt-6 flex gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-navy-800 border border-navy-600 text-white placeholder-navy-400 focus:outline-none focus:border-primary-400 text-sm"
              />
              <button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors text-sm whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold">NexaMart</span>
            </div>
            <p className="text-navy-300 text-sm leading-relaxed">
              Your premium destination for home gadgets, kitchen accessories, and smart lifestyle products.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-navy-300 hover:text-white text-sm transition-colors">All Products</Link></li>
              <li><Link href="/flash-deals" className="text-navy-300 hover:text-white text-sm transition-colors">Flash Deals</Link></li>
              <li><Link href="/wishlist" className="text-navy-300 hover:text-white text-sm transition-colors">Wishlist</Link></li>
              <li><Link href="/cart" className="text-navy-300 hover:text-white text-sm transition-colors">Cart</Link></li>
              <li><Link href="/track-order" className="text-navy-300 hover:text-white text-sm transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-3">
              <li><Link href="/category/home-gadgets" className="text-navy-300 hover:text-white text-sm transition-colors">Home Gadgets</Link></li>
              <li><Link href="/category/kitchen-accessories" className="text-navy-300 hover:text-white text-sm transition-colors">Kitchen Accessories</Link></li>
              <li><Link href="/category/home-organizers" className="text-navy-300 hover:text-white text-sm transition-colors">Home Organizers</Link></li>
              <li><Link href="/category/smart-everyday-products" className="text-navy-300 hover:text-white text-sm transition-colors">Smart Products</Link></li>
              <li><Link href="/category/lifestyle-accessories" className="text-navy-300 hover:text-white text-sm transition-colors">Lifestyle Accessories</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-navy-300 text-sm">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                Cairo, Egypt
              </li>
              <li className="flex items-center gap-3 text-navy-300 text-sm">
                <Phone size={16} className="flex-shrink-0" />
                +20 100 000 0000
              </li>
              <li className="flex items-center gap-3 text-navy-300 text-sm">
                <Mail size={16} className="flex-shrink-0" />
                hello@nexamart.com
              </li>
              <li className="flex items-center gap-3 text-navy-300 text-sm">
                <Package size={16} className="flex-shrink-0" />
                Delivery: 2-5 Business Days
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-navy-700">
        <div className="container-custom py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-navy-400 text-sm">© 2026 NexaMart. All rights reserved.</p>
          <div className="flex items-center gap-4 text-navy-400 text-sm">
            <span>Cash on Delivery</span>
            <span className="w-1 h-1 rounded-full bg-navy-600" />
            <span>Free Returns</span>
            <span className="w-1 h-1 rounded-full bg-navy-600" />
            <span>Secure Shopping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
