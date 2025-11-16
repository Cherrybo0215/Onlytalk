import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 打赏帖子或评论
router.post(
  '/',
  authenticateToken,
  [
    body('related_type').isIn(['post', 'comment']).withMessage('类型必须是post或comment'),
    body('related_id').isInt().withMessage('相关ID必须是整数'),
    body('points').isInt({ min: 1, max: 1000 }).withMessage('打赏积分必须在1-1000之间'),
    body('message').optional().isLength({ max: 100 }).withMessage('留言长度不能超过100个字符'),
  ],
  (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { related_type, related_id, points, message } = req.body;
      const fromUserId = req.userId;

      // 检查用户积分是否足够
      const fromUser = db.prepare('SELECT points FROM users WHERE id = ?').get(fromUserId) as any;
      if (!fromUser || fromUser.points < points) {
        return res.status(400).json({ error: '积分不足' });
      }

      // 获取被打赏的用户ID
      let toUserId: number;
      if (related_type === 'post') {
        const post = db.prepare('SELECT author_id FROM posts WHERE id = ?').get(related_id) as any;
        if (!post) {
          return res.status(404).json({ error: '帖子不存在' });
        }
        toUserId = post.author_id;
      } else {
        const comment = db.prepare('SELECT author_id FROM comments WHERE id = ?').get(related_id) as any;
        if (!comment) {
          return res.status(404).json({ error: '评论不存在' });
        }
        toUserId = comment.author_id;
      }

      if (toUserId === fromUserId) {
        return res.status(400).json({ error: '不能打赏自己' });
      }

      // 创建打赏表（如果不存在）
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS rewards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_user_id INTEGER NOT NULL,
            to_user_id INTEGER NOT NULL,
            points INTEGER NOT NULL,
            related_type TEXT NOT NULL,
            related_id INTEGER NOT NULL,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
      } catch (e) {}

      // 扣除打赏者积分
      db.prepare('UPDATE users SET points = points - ? WHERE id = ?').run(points, fromUserId);

      // 增加被打赏者积分
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(points, toUserId);

      // 记录打赏
      const result = db
        .prepare(
          'INSERT INTO rewards (from_user_id, to_user_id, points, related_type, related_id, message) VALUES (?, ?, ?, ?, ?, ?)'
        )
        .run(fromUserId, toUserId, points, related_type, related_id, message || null);

      // 发送通知
      const fromUserInfo = db.prepare('SELECT username FROM users WHERE id = ?').get(fromUserId) as any;
      db.prepare(
        'INSERT INTO notifications (user_id, type, title, content, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(
        toUserId,
        'reward',
        '收到打赏',
        `${fromUserInfo?.username || '有人'} 打赏了你 ${points} 积分${message ? `：${message}` : ''}`,
        related_id,
        related_type
      );

      // 更新被打赏者的等级
      const toUser = db.prepare('SELECT points FROM users WHERE id = ?').get(toUserId) as any;
      const newLevel = Math.floor(toUser.points / 100) + 1;
      db.prepare('UPDATE users SET level = ? WHERE id = ?').run(newLevel, toUserId);

      res.json({
        success: true,
        message: '打赏成功',
        reward: {
          id: result.lastInsertRowid,
          points,
          from_user_id: fromUserId,
          to_user_id: toUserId,
        },
      });
    } catch (error) {
      console.error('打赏错误:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  }
);

export default router;

