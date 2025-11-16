import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { db } from '../database';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 获取评论列表
router.get(
  '/post/:postId',
  [
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
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ error: '无效的帖子ID' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          c.*,
          u.username as author_name,
          u.avatar as author_avatar,
          parent.author_name as parent_author_name
      `;

      if (req.userId) {
        query += `,
          (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id AND user_id = ?) as is_liked
        `;
      }

      query += `
        FROM comments c
        LEFT JOIN users u ON c.author_id = u.id
        LEFT JOIN (
          SELECT c2.id, u2.username as author_name
          FROM comments c2
          LEFT JOIN users u2 ON c2.author_id = u2.id
        ) parent ON c.parent_id = parent.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
        LIMIT ? OFFSET ?
      `;

      const params: any[] = [];
      if (req.userId) {
        params.push(req.userId);
      }
      params.push(postId, limit, offset);

      const comments = db.prepare(query).all(...params);

      const total = (db.prepare('SELECT COUNT(*) as total FROM comments WHERE post_id = ?').get(postId) as any).total;

      res.json({
        comments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('获取评论列表错误:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  }
);

// 创建评论
router.post(
  '/',
  authenticateToken,
  [
    body('content').notEmpty().withMessage('评论内容不能为空'),
    body('post_id').isInt().withMessage('帖子ID必须是整数'),
    body('parent_id').optional().isInt().withMessage('父评论ID必须是整数'),
  ],
  (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { content, post_id, parent_id } = req.body;

      // 检查帖子是否存在
      const post = db.prepare('SELECT id, is_locked FROM posts WHERE id = ?').get(post_id) as any;
      if (!post) {
        return res.status(404).json({ error: '帖子不存在' });
      }

      if (post.is_locked) {
        return res.status(403).json({ error: '该帖子已锁定，无法评论' });
      }

      // 如果parent_id存在，检查父评论是否存在
      if (parent_id) {
        const parentComment = db.prepare('SELECT id FROM comments WHERE id = ? AND post_id = ?').get(parent_id, post_id);
        if (!parentComment) {
          return res.status(404).json({ error: '父评论不存在' });
        }
      }

      const result = db
        .prepare('INSERT INTO comments (content, post_id, author_id, parent_id) VALUES (?, ?, ?, ?)')
        .run(content, post_id, req.userId, parent_id || null);

      const commentId = result.lastInsertRowid as number;

      // 评论奖励积分
      db.prepare('UPDATE users SET points = points + 2 WHERE id = ?').run(req.userId);

      // 如果回复别人的评论，给被回复者发送通知
      if (parent_id) {
        const parentComment = db.prepare('SELECT author_id FROM comments WHERE id = ?').get(parent_id) as any;
        if (parentComment && parentComment.author_id !== req.userId) {
          const author = db.prepare('SELECT username FROM users WHERE id = ?').get(req.userId) as any;
          db.prepare(
            'INSERT INTO notifications (user_id, type, title, content, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)'
          ).run(
            parentComment.author_id,
            'reply',
            '收到新回复',
            `${author.username || '有人'} 回复了你的评论`,
            commentId,
            'comment'
          );
        }
      } else {
        // 如果回复帖子，给帖子作者发送通知
        const post = db.prepare('SELECT author_id FROM posts WHERE id = ?').get(post_id) as any;
        if (post && post.author_id !== req.userId) {
          const author = db.prepare('SELECT username FROM users WHERE id = ?').get(req.userId) as any;
          db.prepare(
            'INSERT INTO notifications (user_id, type, title, content, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)'
          ).run(
            post.author_id,
            'comment',
            '收到新评论',
            `${author.username || '有人'} 评论了你的帖子`,
            commentId,
            'comment'
          );
        }
      }
      const comment = db
        .prepare(
          `
          SELECT 
            c.*,
            u.username as author_name,
            u.avatar as author_avatar
          FROM comments c
          LEFT JOIN users u ON c.author_id = u.id
          WHERE c.id = ?
        `
        )
        .get(commentId) as any;

      res.status(201).json(comment);
    } catch (error) {
      console.error('创建评论错误:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  }
);

// 更新评论
router.put(
  '/:id',
  authenticateToken,
  [body('content').notEmpty().withMessage('评论内容不能为空')],
  (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ error: '无效的评论ID' });
      }

      // 检查评论是否存在及权限
      const comment = db.prepare('SELECT author_id FROM comments WHERE id = ?').get(commentId) as any;
      if (!comment) {
        return res.status(404).json({ error: '评论不存在' });
      }

      if (comment.author_id !== req.userId) {
        return res.status(403).json({ error: '无权修改此评论' });
      }

      const { content } = req.body;
      db.prepare('UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(content, commentId);

      const updatedComment = db
        .prepare(
          `
          SELECT 
            c.*,
            u.username as author_name,
            u.avatar as author_avatar
          FROM comments c
          LEFT JOIN users u ON c.author_id = u.id
          WHERE c.id = ?
        `
        )
        .get(commentId) as any;

      res.json(updatedComment);
    } catch (error) {
      console.error('更新评论错误:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  }
);

// 删除评论
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
      return res.status(400).json({ error: '无效的评论ID' });
    }

    // 检查评论是否存在及权限
    const comment = db.prepare('SELECT author_id FROM comments WHERE id = ?').get(commentId) as any;
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    // 检查是否是作者或管理员
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.userId) as any;
    if (comment.author_id !== req.userId && user.role !== 'admin') {
      return res.status(403).json({ error: '无权删除此评论' });
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
    res.json({ message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;

