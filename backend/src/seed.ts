import prisma from './config/database';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.admin.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', password: hashedPassword, name: 'Admin', role: 'admin' },
  });
  console.log('✅ Admin created: admin@example.com / admin123');

  // Create categories
  const categories = [
    { name: 'Home Gadgets', icon: 'zap', description: 'Smart and innovative gadgets for your home' },
    { name: 'Kitchen Accessories', icon: 'utensils-crossed', description: 'Premium kitchen tools and accessories' },
    { name: 'Home Organizers', icon: 'boxes', description: 'Keep your space tidy and organized' },
    { name: 'Smart Everyday Products', icon: 'cpu', description: 'Smart products for modern living' },
    { name: 'Lifestyle Accessories', icon: 'sparkles', description: 'Elevate your daily lifestyle' },
  ];

  for (let i = 0; i < categories.length; i++) {
    const slug = categories[i].name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { ...categories[i], slug, order: i },
    });
  }
  console.log('✅ Categories created');

  // Create homepage sections
  const sections = [
    'hero_slider', 'promotional_cards', 'featured_products', 'trending_products',
    'flash_deals', 'categories', 'testimonials', 'newsletter', 'footer',
  ];
  for (let i = 0; i < sections.length; i++) {
    await prisma.homepageSection.upsert({
      where: { section: sections[i] },
      update: {},
      create: { section: sections[i], enabled: true, order: i },
    });
  }
  console.log('✅ Homepage sections created');

  // Create default settings
  const settings = {
    site_name: 'NexaMart',
    site_description: 'Premium Home & Lifestyle Products',
    contact_email: 'hello@nexamart.com',
    contact_phone: '+20 100 000 0000',
    address: 'Cairo, Egypt',
    social_facebook: '#',
    social_instagram: '#',
    social_twitter: '#',
    social_tiktok: '#',
    whatsapp_number: '+201000000000',
    delivery_info: 'Estimated Delivery: 2-5 Business Days',
    payment_info: 'Cash on Delivery — You pay when your order arrives.',
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSettings.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
  }
  console.log('✅ Settings created');

  console.log('🎉 Seeding complete!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
