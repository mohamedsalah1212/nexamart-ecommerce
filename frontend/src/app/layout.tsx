import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartProvider';
import { RecentSalesPopup } from '@/components/ui/RecentSalesPopup';

import { SettingsProvider } from '@/components/SettingsProvider';
import { themes } from '@/lib/themes';

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

async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/settings`, { 
      next: { revalidate: 60 } 
    });
    if (!res.ok) return {};
    return res.json();
  } catch (error) {
    return {};
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const activeTheme = settings.site_theme || 'blue';
  const themeVariables = themes[activeTheme] || themes['blue'];

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root { ${themeVariables} }` }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <SettingsProvider settings={settings}>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <RecentSalesPopup />
          </CartProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
