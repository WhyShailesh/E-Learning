import express from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

import fs from 'fs';
import path from 'path';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', verifyToken, requireRole('admin', 'instructor'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    // Check if Cloudinary is configured
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME) {
      // Cloudinary upload
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'learnova_courses',
        resource_type: 'auto'
      });
      return res.status(200).json({ success: true, url: result.secure_url });
    } else {
      // Local fallback upload
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const ext = req.file.originalname.split('.').pop() || 'png';
      const filename = `course_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      
      fs.writeFileSync(filepath, req.file.buffer);
      
      // Return local URL
      const baseUrl = process.env.API_URL || 'http://localhost:5000';
      return res.status(200).json({ success: true, url: `${baseUrl}/uploads/${filename}` });
    }
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, message: 'Image upload failed: ' + error.message });
  }
});

export default router;
