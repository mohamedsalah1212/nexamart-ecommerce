import { Request, Response } from 'express';
import prisma from '../config/database';

export const getSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findMany();
    const result: Record<string, any> = {};
    for (const s of settings) {
      try { result[s.key] = JSON.parse(s.value as string); } catch { result[s.key] = s.value; }
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    await prisma.siteSettings.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
    res.json({ message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const getHomepageSections = async (_req: Request, res: Response) => {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
};

export const updateHomepageSection = async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const { enabled } = req.body;
    await prisma.homepageSection.upsert({
      where: { section },
      update: { enabled },
      create: { section, enabled, order: 0 },
    });
    res.json({ message: 'Section updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update section' });
  }
};
