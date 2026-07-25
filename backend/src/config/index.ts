import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ecommerce',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};
