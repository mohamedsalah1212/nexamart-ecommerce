import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

let storage: multer.StorageEngine;

if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'nexamart-products',
      allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'mp4', 'webm'],
    } as any,
  });
} else {
  const uploadDir = path.resolve(config.uploadDir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });
}

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg|mp4|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
