import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = file.mimetype.split('/')[0];
    let subDir = 'files';
    
    if (fileType === 'image') {
      subDir = 'images';
    } else if (file.mimetype.includes('video')) {
      subDir = 'videos';
    }
    
    const dir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg|mp4|webm|pdf|doc|docx|xls|xlsx|txt|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || 
                   file.mimetype.startsWith('image/') || 
                   file.mimetype.startsWith('video/') ||
                   file.mimetype.includes('pdf') ||
                   file.mimetype.includes('document') ||
                   file.mimetype.includes('spreadsheet') ||
                   file.mimetype.includes('text') ||
                   file.mimetype.includes('zip') ||
                   file.mimetype.includes('rar');

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'));
  }
};

// 配置multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter
});

// 单文件上传
router.post('/single', authenticateToken, upload.single('file'), (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    const fileType = req.file.mimetype.split('/')[0];
    const subDir = fileType === 'image' ? 'images' : fileType === 'video' ? 'videos' : 'files';
    const fileUrl = `/uploads/${subDir}/${req.file.filename}`;

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        type: fileType
      }
    });
  } catch (error: any) {
    console.error('文件上传错误:', error);
    res.status(500).json({ error: error.message || '文件上传失败' });
  }
});

// 多文件上传
router.post('/multiple', authenticateToken, upload.array('files', 10), (req: AuthRequest, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    const files = (req.files as Express.Multer.File[]).map(file => {
      const fileType = file.mimetype.split('/')[0];
      const subDir = fileType === 'image' ? 'images' : fileType === 'video' ? 'videos' : 'files';
      const fileUrl = `/uploads/${subDir}/${file.filename}`;

      return {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl,
        type: fileType
      };
    });

    res.json({
      success: true,
      files: files
    });
  } catch (error: any) {
    console.error('文件上传错误:', error);
    res.status(500).json({ error: error.message || '文件上传失败' });
  }
});

export default router;

