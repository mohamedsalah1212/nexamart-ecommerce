import { Request, Response } from 'express';
import prisma from '../config/database';

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) return res.json([]);

    const items = await prisma.wishlist.findMany({
      where: { sessionId },
      include: {
        product: {
          include: { images: { orderBy: { order: 'asc' }, take: 1 } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(items.map(i => ({
      id: i.id,
      productId: i.productId,
      name: i.product.name,
      slug: i.product.slug,
      price: i.product.price,
      discountPrice: i.product.discountPrice,
      image: i.product.images[0]?.url || null,
      createdAt: i.createdAt,
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

    const { productId } = req.body;

    const existing = await prisma.wishlist.findUnique({
      where: { sessionId_productId: { sessionId, productId } },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return res.json({ message: 'Removed from wishlist', inWishlist: false });
    }

    await prisma.wishlist.create({ data: { sessionId, productId } });
    res.json({ message: 'Added to wishlist', inWishlist: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    await prisma.wishlist.delete({ where: { id: req.params.id } });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
};

export const checkWishlist = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    const { productId } = req.params;
    if (!sessionId) return res.json({ inWishlist: false });

    const item = await prisma.wishlist.findUnique({
      where: { sessionId_productId: { sessionId, productId } },
    });
    res.json({ inWishlist: !!item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check wishlist' });
  }
};
