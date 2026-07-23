import { Request, Response } from 'express';
import prisma from '../config/database';

export const getBanners = async (_req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

export const getActiveBanners = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: null },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { order: 'asc' },
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const maxOrder = await prisma.banner.aggregate({ _max: { order: true } });

    const banner = await prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        link: data.link,
        desktopImage: data.desktopImage,
        mobileImage: data.mobileImage,
        isActive: data.isActive !== false,
        order: (maxOrder._max.order ?? -1) + 1,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create banner' });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updateData: any = {};
    const fields = ['title', 'subtitle', 'link', 'desktopImage', 'mobileImage', 'isActive', 'order'];
    for (const field of fields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;

    const banner = await prisma.banner.update({ where: { id }, data: updateData });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } });
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
};

export const reorderBanners = async (req: Request, res: Response) => {
  try {
    const { orders } = req.body;
    for (const item of orders) {
      await prisma.banner.update({ where: { id: item.id }, data: { order: item.order } });
    }
    res.json({ message: 'Banners reordered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder banners' });
  }
};
