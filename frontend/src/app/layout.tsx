import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartProvider';
import { RecentSalesPopup } from '@/components/ui/RecentSalesPopup';

export const metadata: Metadata = {
  title: {
    default: 'NexaMart — Premium Home & Lifestyle Products',
    template: '%s | NexaMart',
  },
  description: 'Discover premium home gadgets, kitchen accessories, organizers, and smart lifestyle products. Shop the best in home innovation.',
  keywords: ['home gadgets', 'kitchen accessories', 'home organizers', 'smart products', 'lifestyle', 'ecommerce'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'NexaMart',
    title: 'NexaMart — Premium Home & Lifestyle Products',
    description: 'Discover premium home gadgets, kitchen accessories, organizers, and smart lifestyle products.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <RecentSalesPopup />
        </CartProvider>
      </body>
    </html>
  );
}
