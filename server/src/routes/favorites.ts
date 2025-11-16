import express from 'express';
import { db } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 收藏/取消收藏帖子
router.post('/posts/:postId', authenticateToken, (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      return res.status(400).json({ error: '无效的帖子ID' });
    }

    // 检查帖子是否存在
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId) as any;
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    // 检查是否已收藏
    const existingFavorite = db
      .prepare('SELECT id FROM favorites WHERE post_id = ? AND user_id = ?')
      .get(postId, req.userId) as any;

    if (existingFavorite) {
      // 取消收藏
      db.prepare('DELETE FROM favorites WHERE post_id = ? AND user_id = ?').run(postId, req.userId);
      res.json({ favorited: false, message: '已取消收藏' });
    } else {
      // 收藏
      db.prepare('INSERT INTO favorites (post_id, user_id) VALUES (?, ?)').run(postId, req.userId);
      res.json({ favorited: true, message: '收藏成功' });
    }
  } catch (error) {
    console.error('收藏帖子错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取用户的收藏列表
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const favorites = db
      .prepare(
        `
        SELECT 
          p.*,
          u.username as author_name,
          u.avatar as author_avatar,
          c.name as category_name,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
          f.created_at as favorited_at
        FROM favorites f
        LEFT JOIN posts p ON f.post_id = p.id
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `
      )
      .all(req.userId, limit, offset);

    const total = (db.prepare('SELECT COUNT(*) as total FROM favorites WHERE user_id = ?').get(req.userId) as any).total;

    res.json({
      favorites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取收藏列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 检查用户是否已收藏帖子
router.get('/posts/:postId/status', authenticateToken, (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      return res.status(400).json({ error: '无效的帖子ID' });
    }

    const favorite = db
      .prepare('SELECT id FROM favorites WHERE post_id = ? AND user_id = ?')
      .get(postId, req.userId) as any;

    res.json({ favorited: !!favorite });
  } catch (error) {
    console.error('检查收藏状态错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;

