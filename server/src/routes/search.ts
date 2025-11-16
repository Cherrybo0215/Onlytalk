import express from 'express';
import { query, validationResult } from 'express-validator';
import { db } from '../database';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 搜索帖子
router.get(
  '/posts',
  [
    query('q').notEmpty().withMessage('搜索关键词不能为空'),
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  ],
  optionalAuth,
  (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const searchQuery = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const searchPattern = `%${searchQuery}%`;

      const posts = db
        .prepare(
          `
          SELECT 
            p.*,
            u.username as author_name,
            u.avatar as author_avatar,
            c.name as category_name,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.title LIKE ? OR p.content LIKE ?
          ORDER BY p.is_pinned DESC, p.created_at DESC
          LIMIT ? OFFSET ?
        `
        )
        .all(searchPattern, searchPattern, limit, offset);

      const total = (db
        .prepare('SELECT COUNT(*) as total FROM posts WHERE title LIKE ? OR content LIKE ?')
        .get(searchPattern, searchPattern) as any).total;

      res.json({
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('搜索帖子错误:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  }
);

export default router;

