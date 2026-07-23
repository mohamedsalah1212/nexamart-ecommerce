import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../config/database';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get admin' });
  }
};

export const customerRegister = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, city, address } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Name, email, password, and phone are required' });
    }

    // Check if email already registered with a password (full account exists)
    const existingByEmail = await prisma.customer.findFirst({ where: { email } });
    if (existingByEmail && existingByEmail.password) {
      return res.status(400).json({ error: 'هذا البريد الإلكتروني مسجّل مسبقاً. قم بتسجيل الدخول.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Look for an existing customer by phone (created during checkout without an account)
    const existingByPhone = await prisma.customer.findFirst({ where: { phone } });

    let customer;
    if (existingByPhone) {
      // Merge: update the existing customer with email/password so their orders are preserved
      customer = await prisma.customer.update({
        where: { id: existingByPhone.id },
        data: {
          name,
          email,
          password: hashedPassword,
          city: city || existingByPhone.city,
          address: address || existingByPhone.address,
        },
      });
    } else {
      // Create brand-new customer
      customer = await prisma.customer.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          city: city || '',
          address: address || '',
        },
      });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email, role: 'customer' },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        address: customer.address,
      },
    });
  } catch (error) {
    console.error('Customer register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const customerLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !customer.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, customer.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email, role: 'customer' },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        address: customer.address,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getCustomerProfile = async (req: any, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.user?.id || req.body.customerId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    slug: true,
                    name: true,
                    images: { where: { isFeatured: true }, take: 1, select: { url: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer profile' });
  }
};

export const seedAdmin = async () => {
  const existing = await prisma.admin.findUnique({ where: { email: 'admin@example.com' } });
  if (!existing) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await prisma.admin.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
      },
    });
    console.log('Default admin created: admin@example.com / admin123');
  }
};
