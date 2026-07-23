import { Request, Response } from 'express';
import prisma from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: { _count: { select: { products: true } } },
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, icon, image, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const maxOrder = await prisma.category.aggregate({ _max: { order: true } });

    const category = await prisma.category.create({
      data: { name, slug, icon, image, description, order: (maxOrder._max.order ?? -1) + 1 },
    });
    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, icon, image, description, order } = req.body;
    const data: any = {};
    if (name) { data.name = name; data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
    if (icon !== undefined) data.icon = icon;
    if (image !== undefined) data.image = image;
    if (description !== undefined) data.description = description;
    if (order !== undefined) data.order = order;

    const category = await prisma.category.update({ where: { id }, data });
    res.json(category);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Category name already exists' });
    if (error.code === 'P2025') return res.status(404).json({ error: 'Category not found' });
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Category not found' });
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

export const reorderCategories = async (req: Request, res: Response) => {
  try {
    const { orders } = req.body; // [{id: string, order: number}]
    for (const item of orders) {
      await prisma.category.update({ where: { id: item.id }, data: { order: item.order } });
    }
    res.json({ message: 'Categories reordered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder categories' });
  }
};
