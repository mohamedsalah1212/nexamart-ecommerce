import { Request, Response } from 'express';
import prisma from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { name, phone, city, address, notes, items } = req.body;

    if (!name || !phone || !city || !address || !items || items.length === 0) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({ where: { phone } });
    if (!customer) {
      customer = await prisma.customer.create({ data: { name, phone, city, address, notes } });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { name, city, address, notes: notes || customer.notes },
      });
    }

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

    // Calculate total
    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      const unitPrice = item.price ? parseFloat(item.price) : (product.discountPrice || product.price);
      total += unitPrice * item.quantity;
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: unitPrice,
        quantity: item.quantity,
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
      });
    }

    const order = await prisma.order.create({
      data: {
        orderId,
        customerId: customer.id,
        total,
        notes,
        items: { create: orderItems },
      },
      include: {
        customer: true,
        items: { include: { product: { select: { name: true, slug: true } } } },
      },
    });

    // Clear cart
    const sessionId = req.headers['x-session-id'] as string;
    if (sessionId) {
      await prisma.cartItem.deleteMany({ where: { sessionId } });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        message: `New order #${orderId} from ${name}`,
        type: 'order',
        orderId: order.id,
      },
    });

    // Generate WhatsApp message for target number +201026134030
    const whatsappMessage = generateWhatsAppMessage(order, orderItems);
    const whatsappUrl = `https://wa.me/201026134030?text=${encodeURIComponent(whatsappMessage)}`;

    res.status(201).json({ order, whatsappMessage, whatsappUrl });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

function generateWhatsAppMessage(order: any, items: any[]) {
  const itemLines = items.map((i: any, idx: number) => {
    const variantInfo = [i.selectedColor ? `اللون: ${i.selectedColor}` : null, i.selectedSize ? `المقاس: ${i.selectedSize}` : null]
      .filter(Boolean).join(' | ');
    const variantStr = variantInfo ? ` (${variantInfo})` : '';
    return `${idx + 1}. ${i.name}${variantStr} × ${i.quantity} = EGP ${(i.price * i.quantity).toFixed(2)}`;
  }).join('\n');

  return `🛍️ *طلب جديد من متجر NexaMart #${order.orderId}*\n\n` +
    `👤 *اسم العميل:* ${order.customer.name}\n` +
    `📞 *رقم الهاتف:* ${order.customer.phone}\n` +
    `📍 *العنوان:* ${order.customer.city}, ${order.customer.address}\n` +
    `📝 *ملاحظات:* ${order.notes || 'لا يوجد'}\n\n` +
    `📦 *المنتجات المطلوبة:*\n${itemLines}\n\n` +
    `💰 *الإجمالي:* EGP ${order.total.toFixed(2)}\n` +
    `📅 *التاريخ:* ${new Date(order.createdAt).toLocaleDateString('ar-EG')}\n\n` +
    `🚚 *الشحن:* 2-5 أيام عمل\n` +
    `💵 *طريقة الدفع:* الدفع عند الاستلام`;
}

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: { include: { product: { select: { name: true, slug: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId: req.params.orderId },
      include: { customer: true, items: { include: { product: { select: { name: true, slug: true } } } } },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { customer: true, items: true },
    });

    await prisma.notification.create({
      data: {
        message: `Order #${order.orderId} status updated to ${status}`,
        type: 'order',
        orderId: order.id,
      },
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const trackOrder = async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId: req.params.orderId },
      select: {
        orderId: true,
        status: true,
        total: true,
        createdAt: true,
        customer: { select: { name: true } },
        items: { select: { name: true, quantity: true, price: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to track order' });
  }
};

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      recentOrders,
      pendingOrders,
      ordersByStatus,
      revenueData,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.customer.count(),
      prisma.product.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true } } },
      }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.groupBy({ by: ['status'], _count: true }),
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Group revenue by day
    const revenueByDay: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      revenueByDay[d.toISOString().split('T')[0]] = 0;
    }
    for (const r of revenueData) {
      const day = r.createdAt.toISOString().split('T')[0];
      if (revenueByDay[day] !== undefined) revenueByDay[day] += r.total;
    }

    const notifications = await prisma.notification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    const unreadNotifications = await prisma.notification.count({ where: { isRead: false } });

    res.json({
      stats: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalCustomers,
        totalProducts,
        pendingOrders,
      },
      ordersByStatus,
      recentOrders,
      revenueChart: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue })),
      notifications,
      unreadNotifications,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
};

export const markNotificationsRead = async (_req: Request, res: Response) => {
  try {
    await prisma.notification.updateMany({ data: { isRead: true } });
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
};
