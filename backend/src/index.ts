import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { seedAdmin } from './controllers/authController';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import bannerRoutes from './routes/banners';
import orderRoutes from './routes/orders';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import reviewRoutes from './routes/reviews';
import settingsRoutes from './routes/settings';

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.frontendUrl, credentials: true }));

// Parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

import { upload } from './middleware/upload';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);

// File Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const file = req.file as any;
  
  if (file.path && file.path.startsWith('http')) {
    return res.json({ url: file.path });
  } else if (file.secure_url || file.url || file.location) {
    return res.json({ url: file.secure_url || file.url || file.location });
  }

  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const url = `${baseUrl}/uploads/${req.file.filename}`;
  res.json({ url });
});

// Root & API welcome info
app.get('/', (_req, res) => {
  res.send('<h1>NexaMart Backend API Running 🚀</h1><p>Visit the frontend store at <a href="http://localhost:3000">http://localhost:3000</a></p>');
});

app.get('/api', (_req, res) => {
  res.json({ message: 'NexaMart API Service Running', frontend: 'http://localhost:3000', admin: 'http://localhost:3000/admin' });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await seedAdmin();
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
