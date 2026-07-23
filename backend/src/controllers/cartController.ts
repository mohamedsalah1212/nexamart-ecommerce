import { Request, Response } from 'express';
import prisma from '../config/database';

export const getCart = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) return res.json({ items: [], total: 0 });
    const cart = await getCartData(sessionId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

    const { productId, quantity = 1, selectedColor, selectedSize } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (!product.availability) return res.status(400).json({ error: 'Product is not available' });

    const existing = await prisma.cartItem.findFirst({
      where: {
        sessionId,
        productId,
        selectedColor: selectedColor || null,
        selectedSize: selectedSize || null,
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          sessionId,
          productId,
          quantity,
          selectedColor: selectedColor || null,
          selectedSize: selectedSize || null,
        },
      });
    }

    const cart = await getCartData(sessionId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      await prisma.cartItem.delete({ where: { id } });
    } else {
      await prisma.cartItem.update({ where: { id }, data: { quantity } });
    }

    const cart = await getCartData(sessionId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    const cart = await getCartData(sessionId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
};

async function getCartData(sessionId: string) {
  const items = await prisma.cartItem.findMany({
    where: { sessionId },
    include: {
      product: {
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          variants: true,
        },
      },
    },
  });

  const formattedItems = items.map(i => {
    // Check if variant has custom price
    let finalPrice = i.product.discountPrice || i.product.price;
    if (i.selectedSize || i.selectedColor) {
      const matchedVariant = i.product.variants.find(v =>
        (i.selectedColor ? v.colorName === i.selectedColor : true) &&
        (i.selectedSize ? v.sizeName === i.selectedSize : true)
      );
      if (matchedVariant?.price) {
        finalPrice = matchedVariant.price;
      }
    }

    // Check if color variant has a specific image
    let image = i.product.images[0]?.url || null;
    if (i.selectedColor) {
      const colorVar = i.product.variants.find(v => v.colorName === i.selectedColor && v.imageUrl);
      if (colorVar?.imageUrl) image = colorVar.imageUrl;
    }

    return {
      id: i.id,
      productId: i.productId,
      name: i.product.name,
      slug: i.product.slug,
      price: finalPrice,
      discountPrice: null,
      quantity: i.quantity,
      image,
      selectedColor: i.selectedColor,
      selectedSize: i.selectedSize,
    };
  });

  const total = formattedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    items: formattedItems,
    total,
  };
}
