import { Request, Response } from 'express';
import prisma from '../config/database';

export const getReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId, customerName, rating, comment } = req.body;

    if (!productId || !customerName || !rating) {
      return res.status(400).json({ error: 'Product ID, name, and rating are required' });
    }

    const review = await prisma.review.create({
      data: { productId, customerName, rating: Math.min(5, Math.max(1, rating)), comment },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        include: { product: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.review.count(),
    ]);

    res.json({
      reviews,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

export const approveReview = async (req: Request, res: Response) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { isApproved: true },
    });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve review' });
  }
};

export const hideReview = async (req: Request, res: Response) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { isApproved: false },
    });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to hide review' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};
