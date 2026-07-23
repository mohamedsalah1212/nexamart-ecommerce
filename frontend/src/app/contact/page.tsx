'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-2xl sm:text-3xl font-bold">Contact Us</h1>
            <p className="text-gray-500 mt-2">We'd love to hear from you. Get in touch with us.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-500 flex-shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Phone</h3>
                  <p className="text-sm text-gray-500 mt-1">+20 100 000 0000</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-500 flex-shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-sm text-gray-500 mt-1">hello@nexamart.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-500 flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Address</h3>
                  <p className="text-sm text-gray-500 mt-1">Cairo, Egypt</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Send size={20} className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Message Sent!</h3>
                  <p className="text-sm text-gray-500 mt-1">We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" className="input-field" placeholder="Your name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="input-field" placeholder="your@email.com" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea className="input-field" rows={4} placeholder="How can we help?" required />
                  </div>
                  <button type="submit" className="btn-primary w-full">Send Message</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
