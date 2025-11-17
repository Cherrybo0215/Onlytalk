import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { db } from '../database';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 获取帖子列表
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('category').optional().isInt().withMessage('分类ID必须是整数'),
  ],
  optionalAuth,
  (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const categoryId = req.query.category ? parseInt(req.query.category as string) : null;

      let query = `
        SELECT 
          p.*,
          u.username as author_name,
          u.avatar as author_avatar,
          c.name as category_name,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      `;

      // 如果用户已登录，添加点赞和收藏状态
      if (req.userId) {
        query += `,
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked,
          (SELECT COUNT(*) FROM favorites WHERE post_id = p.id AND user_id = ?) as is_favorited
        `;
      }

      query += `
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
      `;

      const params: any[] = [];
      if (req.userId) {
        params.push(req.userId, req.userId);
      }
      
      if (categoryId) {
        query += ' WHERE p.category_id = ?';
        params.push(categoryId);
      }

      query += ' ORDER BY p.is_pinned DESC, p.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const posts = db.prepare(query).all(...params);

      // 获取总数
      let countQuery = 'SELECT COUNT(*) as total FROM posts';
      if (categoryId) {
        countQuery += ' WHERE category_id = ?';
      }
      const total = (db.prepare(countQuery).get(categoryId || []) as any).total;

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
      console.error('获取帖子列表错误:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  }
);

// 获取帖子详情
router.get('/:id', optionalAuth, (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      return res.status(400).json({ error: '无效的帖子ID' });
    }

    // 增加浏览量
    db.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').run(postId);

    let query = `
      SELECT 
        p.*,
        u.username as author_name,
        u.avatar as author_avatar,
        c.name as category_name,
        c.id as category_id
    `;

    const params: any[] = [];
    if (req.userId) {
      query += `,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked,
        (SELECT COUNT(*) FROM favorites WHERE post_id = p.id AND user_id = ?) as is_favorited
      `;
      params.push(req.userId, req.userId);
    }

    query += `
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    params.push(postId);

    const post = db.prepare(query).get(...params) as any;

    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    res.json(post);
  } catch (error) {
    console.error('获取帖子详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建帖子
router.post(
  '/',
  authenticateToken,
  [
    body('title').notEmpty().withMessage('标题不能为空').isLength({ max: 200 }).withMessage('标题长度不能超过200个字符'),
    body('content').notEmpty().withMessage('内容不能为空'),
    body('category_id').optional().isInt().withMessage('分类ID必须是整数'),
  ],
  (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content, category_id, attachments } = req.body;

      const result = db
        .prepare('INSERT INTO posts (title, content, author_id, category_id, attachments) VALUES (?, ?, ?, ?, ?)')
        .run(title, content, req.userId, category_id || null, attachments || null);

      const postId = result.lastInsertRowid as number;

      // 发帖奖励积分
      db.prepare('UPDATE users SET points = points + 5 WHERE id = ?').run(req.userId);
      
      // 更新用户等级
      const user = db.prepare('SELECT points FROM users WHERE id = ?').get(req.userId) as any;
      const newLevel = Math.floor(user.points / 30) + 1;
      db.prepare('UPDATE users SET level = ? WHERE id = ?').run(newLevel, req.userId);
      
      const post = db
        .prepare(
          `
          SELECT 
            p.*,
            u.username as author_name,
            u.avatar as author_avatar,
            c.name as category_name
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.id = ?
        `
        )
        .get(postId) as any;

      res.status(201).json(post);
    } catch (error) {
      console.error('创建帖子错误:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  }
);

// 更新帖子
router.put(
  '/:id',
  authenticateToken,
  [
    body('title').optional().notEmpty().withMessage('标题不能为空').isLength({ max: 200 }).withMessage('标题长度不能超过200个字符'),
    body('content').optional().notEmpty().withMessage('内容不能为空'),
  ],
  (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ error: '无效的帖子ID' });
      }

      // 检查帖子是否存在及权限
      const post = db.prepare('SELECT author_id FROM posts WHERE id = ?').get(postId) as any;
      if (!post) {
        return res.status(404).json({ error: '帖子不存在' });
      }

      // 检查是否是作者或管理员
      const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.userId) as any;
      if (post.author_id !== req.userId && user.role !== 'admin') {
        return res.status(403).json({ error: '无权修改此帖子' });
      }

      const { title, content, category_id } = req.body;
      const updates: string[] = [];
      const params: any[] = [];

      if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
      }
      if (content !== undefined) {
        updates.push('content = ?');
        params.push(content);
      }
      if (category_id !== undefined) {
        updates.push('category_id = ?');
        params.push(category_id);
      }
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(postId);

      db.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`).run(...params);

      const updatedPost = db
        .prepare(
          `
          SELECT 
            p.*,
            u.username as author_name,
            u.avatar as author_avatar,
            c.name as category_name
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.id = ?
        `
        )
        .get(postId) as any;

      res.json(updatedPost);
    } catch (error) {
      console.error('更新帖子错误:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  }
);

// 获取热门帖子
router.get('/hot', optionalAuth, (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    let query = `
      SELECT 
        p.*,
        u.username as author_name,
        u.avatar as author_avatar,
        c.name as category_name,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        (p.views * 0.1 + p.likes * 2 + (SELECT COUNT(*) FROM comments WHERE post_id = p.id) * 1.5) as hot_score
    `;

    if (req.userId) {
      query += `,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked,
        (SELECT COUNT(*) FROM favorites WHERE post_id = p.id AND user_id = ?) as is_favorited
      `;
    }

    query += `
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.created_at >= datetime('now', '-7 days')
      ORDER BY hot_score DESC, p.created_at DESC
      LIMIT ?
    `;

    const params: any[] = [];
    if (req.userId) {
      params.push(req.userId, req.userId);
    }
    params.push(limit);

    const posts = db.prepare(query).all(...params);

    res.json({ posts });
  } catch (error) {
    console.error('获取热门帖子错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除帖子
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      return res.status(400).json({ error: '无效的帖子ID' });
    }

    // 检查帖子是否存在及权限
    const post = db.prepare('SELECT author_id FROM posts WHERE id = ?').get(postId) as any;
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    // 检查是否是作者或管理员
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.userId) as any;
    if (post.author_id !== req.userId && user.role !== 'admin') {
      return res.status(403).json({ error: '无权删除此帖子' });
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
    res.json({ message: '帖子删除成功' });
  } catch (error) {
    console.error('删除帖子错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;

