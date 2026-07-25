import { Request, Response } from 'express';
import prisma from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, featured, bestSeller, trending, flashDeal, page = '1', limit = '12', sort, minPrice, maxPrice } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { availability: true };

    if (category) where.category = { slug: category as string };
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { brand: { contains: search as string, mode: 'insensitive' } },
        { shortDescription: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (featured === 'true') where.isFeatured = true;
    if (bestSeller === 'true') where.isBestSeller = true;
    if (trending === 'true') where.isTrending = true;
    if (flashDeal === 'true') where.isFlashDeal = true;
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice as string) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice as string) };

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'name_asc') orderBy = { name: 'asc' };
    else if (sort === 'name_desc') orderBy = { name: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { order: 'asc' }, take: 3 },
          category: { select: { name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products: products.map(p => ({
        ...p,
        avgRating: 0,
        reviewCount: p._count.reviews,
        mainImage: p.images.find(i => i.isFeatured)?.url || p.images[0]?.url || null,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        images: { orderBy: { order: 'asc' } },
        variants: true,
        category: { select: { id: true, name: true, slug: true } },
        reviews: { where: { isApproved: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    const avgRating = product.reviews.length
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, availability: true },
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
      take: 8,
    });

    res.json({
      product: {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
      },
      related: related.map(r => ({
        ...r,
        mainImage: r.images[0]?.url || null,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + uuidv4().slice(0, 8);
    const imageUrl = data.imageUrl || data.mainImage;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        shortDescription: data.shortDescription,
        description: data.description,
        richDescription: data.richDescription,
        specifications: data.specifications,
        features: data.features ? (Array.isArray(data.features) ? JSON.stringify(data.features) : data.features) : '[]',
        brand: data.brand,
        sku: data.sku || `SKU-${uuidv4().slice(0, 8).toUpperCase()}`,
        categoryId: data.categoryId,
        price: parseFloat(data.price),
        discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : null,
        deliveryTime: data.deliveryTime || '2-5 Business Days',
        availability: data.availability !== false,
        isFeatured: data.isFeatured === true,
        isBestSeller: data.isBestSeller === true,
        isTrending: data.isTrending === true,
        isFlashDeal: data.isFlashDeal === true,
        flashDealEnd: data.flashDealEnd ? new Date(data.flashDealEnd) : null,
      },
      include: { images: true, variants: true, category: true },
    });

    const imageUrls: string[] = Array.isArray(data.imageUrls)
      ? data.imageUrls
      : (data.imageUrl || data.mainImage) ? [data.imageUrl || data.mainImage] : [];

    if (imageUrls.length > 0) {
      await prisma.media.createMany({
        data: imageUrls.map((url, i) => ({
          productId: product.id,
          url,
          isFeatured: i === 0,
          order: i,
        })),
      });
    }

    if (Array.isArray(data.variants) && data.variants.length > 0) {
      await prisma.productVariant.createMany({
        data: data.variants.map((v: any) => ({
          productId: product.id,
          colorName: v.colorName || null,
          colorHex: v.colorHex || null,
          sizeName: v.sizeName || null,
          price: v.price ? parseFloat(v.price) : null,
          imageUrl: v.imageUrl || null,
        })),
      });
    }

    const updated = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true, variants: true, category: true },
    });

    res.status(201).json(updated);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Product with this slug or SKU already exists' });
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const imageUrls: string[] = Array.isArray(data.imageUrls)
      ? data.imageUrls
      : (data.imageUrl || data.mainImage) ? [data.imageUrl || data.mainImage] : [];

    const updateData: any = {};
    const fields = ['name', 'shortDescription', 'description', 'richDescription', 'specifications', 'brand', 'sku', 'categoryId', 'deliveryTime', 'availability', 'isFeatured', 'isBestSeller', 'isTrending', 'isFlashDeal', 'flashDealEnd'];
    if (data.features !== undefined) updateData.features = Array.isArray(data.features) ? JSON.stringify(data.features) : data.features;
    for (const field of fields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.discountPrice !== undefined) updateData.discountPrice = data.discountPrice ? parseFloat(data.discountPrice) : null;
    if (data.name && !data.slug) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + uuidv4().slice(0, 4);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { images: { orderBy: { order: 'asc' } }, variants: true, category: true },
    });

    if (imageUrls.length > 0) {
      // Replace existing media records with new list
      await prisma.media.deleteMany({ where: { productId: id } });
      await prisma.media.createMany({
        data: imageUrls.map((url, i) => ({
          productId: id,
          url,
          isFeatured: i === 0,
          order: i,
        })),
      });
    }

    if (Array.isArray(data.variants)) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      if (data.variants.length > 0) {
        await prisma.productVariant.createMany({
          data: data.variants.map((v: any) => ({
            productId: id,
            colorName: v.colorName || null,
            colorHex: v.colorHex || null,
            sizeName: v.sizeName || null,
            price: v.price ? parseFloat(v.price) : null,
            imageUrl: v.imageUrl || null,
          })),
        });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true, category: true },
    });

    res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Product not found' });
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Product not found' });
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const duplicateProduct = async (req: Request, res: Response) => {
  try {
    const original = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { images: true },
    });
    if (!original) return res.status(404).json({ error: 'Product not found' });

    const newSlug = `${original.slug}-copy-${uuidv4().slice(0, 4)}`;
    const newSku = `SKU-${uuidv4().slice(0, 8).toUpperCase()}`;

    const product = await prisma.product.create({
      data: {
        name: `${original.name} (Copy)`,
        slug: newSlug,
        shortDescription: original.shortDescription,
        description: original.description,
        richDescription: original.richDescription,
        specifications: original.specifications,
        features: original.features || '[]',
        brand: original.brand,
        sku: newSku,
        categoryId: original.categoryId,
        price: original.price,
        discountPrice: original.discountPrice,
        deliveryTime: original.deliveryTime,
        availability: false,
        isFeatured: false,
        isBestSeller: false,
        isTrending: false,
        isFlashDeal: false,
      },
      include: { images: true, category: true },
    });

    // Copy images
    for (const img of original.images) {
      await prisma.media.create({
        data: {
          productId: product.id,
          url: img.url,
          type: img.type,
          isFeatured: img.isFeatured,
          order: img.order,
        },
      });
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to duplicate product' });
  }
};

export const uploadProductMedia = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const files = req.files as any[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    console.log("Files:", files);

    // تأكد إن المنتج موجود
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const maxOrder = await prisma.media.aggregate({
      where: { productId },
      _max: { order: true },
    });

    const media = await Promise.all(
      files.map((file: any, index: number) => {
        const imageUrl =
          file.path ||
          file.secure_url ||
          file.url ||
          (file.filename ? `/uploads/${file.filename}` : null);

        console.log("Image URL:", imageUrl);

        return prisma.media.create({
          data: {
            productId,
            url: imageUrl!,
            type: file.mimetype.startsWith("video") ? "video" : "image",
            isFeatured:
              index === 0 && (maxOrder._max.order ?? -1) === -1,
            order: (maxOrder._max.order ?? -1) + index + 1,
          },
        });
      })
    );

    return res.status(201).json(media);
  } catch (err: any) {
    console.error("UPLOAD ERROR");
    console.error(err);
    console.error(err?.message);
    console.error(err?.code);

    return res.status(500).json({
      error: err?.message || "Upload failed",
    });
  }
};

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    await prisma.media.delete({ where: { id: req.params.id } });
    res.json({ message: 'Media deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete media' });
  }
};

export const reorderMedia = async (req: Request, res: Response) => {
  try {
    const { media } = req.body;
    for (const item of media) {
      await prisma.media.update({
        where: { id: item.id },
        data: { order: item.order, isFeatured: item.isFeatured || false },
      });
    }
    res.json({ message: 'Media reordered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder media' });
  }
};

// ─── Related Products ─────────────────────────────────────────────────────────
const PRODUCT_SELECT = {
  id: true, name: true, slug: true, price: true, discountPrice: true,
  shortDescription: true, brand: true,
  images: { where: { isFeatured: true }, take: 1, select: { url: true } },
  category: { select: { name: true, slug: true } },
};

export const getRelatedProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get the current product
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, categoryId: true, brand: true, shortDescription: true, description: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (GEMINI_API_KEY) {
      // ── Gemini AI Path ──────────────────────────────────────────────────────
      try {
        // Get all products except this one for Gemini to choose from
        const allProducts = await prisma.product.findMany({
          where: { id: { not: id }, availability: true },
          select: { id: true, name: true, shortDescription: true, brand: true, category: { select: { name: true } } },
          take: 80,
        });

        const productList = allProducts.map((p, i) =>
          `${i + 1}. ID:${p.id} | ${p.name} | ${p.category.name} | ${p.shortDescription || ''}`
        ).join('\n');

        const prompt = `You are a product recommendation engine for an Egyptian e-commerce store.

Current product: "${product.name}" (${product.shortDescription || product.description || ''})

Available products:
${productList}

Return ONLY a JSON array of the 4 most related product IDs (no explanation, just JSON):
["id1","id2","id3","id4"]`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        );

        const geminiData: any = await geminiRes.json();
        const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\[.*?\]/s);

        if (jsonMatch) {
          const ids: string[] = JSON.parse(jsonMatch[0]);
          const related = await prisma.product.findMany({
            where: { id: { in: ids }, availability: true },
            select: PRODUCT_SELECT,
          });
          // Return in the order Gemini suggested
          const ordered = ids.map(rid => related.find(r => r.id === rid)).filter(Boolean);
          return res.json({ related: ordered, source: 'gemini' });
        }
      } catch (geminiErr) {
        console.error('Gemini error, falling back:', geminiErr);
      }
    }

    // ── Fallback: same category ──────────────────────────────────────────────
    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: id }, availability: true },
      select: PRODUCT_SELECT,
      orderBy: { isBestSeller: 'desc' },
      take: 4,
    });

    // If fewer than 4, fill with other products
    if (related.length < 4) {
      const extras = await prisma.product.findMany({
        where: { id: { notIn: [id, ...related.map(r => r.id)] }, availability: true },
        select: PRODUCT_SELECT,
        orderBy: { isFeatured: 'desc' },
        take: 4 - related.length,
      });
      related.push(...extras);
    }

    res.json({ related, source: 'category' });
  } catch (error) {
    console.error('Related products error:', error);
    res.status(500).json({ error: 'Failed to get related products' });
  }
};

