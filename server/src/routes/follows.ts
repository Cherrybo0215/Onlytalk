import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { db } from '../database';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 关注/取消关注用户
router.post('/:userId', authenticateToken, (req: AuthRequest, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    if (isNaN(targetUserId)) {
      return res.status(400).json({ error: '无效的用户ID' });
    }

    if (targetUserId === req.userId) {
      return res.status(400).json({ error: '不能关注自己' });
    }

    // 检查目标用户是否存在
    const targetUser = db.prepare('SELECT id FROM users WHERE id = ?').get(targetUserId) as any;
    if (!targetUser) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 检查是否已关注
    const existingFollow = db
      .prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?')
      .get(req.userId, targetUserId) as any;

    if (existingFollow) {
      // 取消关注
      db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.userId, targetUserId);
      
      // 发送通知
      const follower = db.prepare('SELECT username FROM users WHERE id = ?').get(req.userId) as any;
      db.prepare(
        'INSERT INTO notifications (user_id, type, title, content, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(
        targetUserId,
        'unfollow',
        '取消关注',
        `${follower.username || '有人'} 取消关注了你`,
        req.userId,
        'user'
      );

      res.json({ followed: false, message: '已取消关注' });
    } else {
      // 关注
      db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.userId, targetUserId);
      
      // 发送通知
      const follower = db.prepare('SELECT username FROM users WHERE id = ?').get(req.userId) as any;
      db.prepare(
        'INSERT INTO notifications (user_id, type, title, content, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(
        targetUserId,
        'follow',
        '新关注',
        `${follower.username || '有人'} 关注了你`,
        req.userId,
        'user'
      );

      res.json({ followed: true, message: '关注成功' });
    }
  } catch (error) {
    console.error('关注操作错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取用户的关注列表
router.get('/following/:userId', optionalAuth, (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: '无效的用户ID' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const following = db
      .prepare(
        `
        SELECT 
          u.id,
          u.username,
          u.avatar,
          u.bio,
          u.points,
          u.level,
          f.created_at as followed_at
        FROM follows f
        LEFT JOIN users u ON f.following_id = u.id
        WHERE f.follower_id = ?
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `
      )
      .all(userId, limit, offset) as any[];

    const total = (db.prepare('SELECT COUNT(*) as total FROM follows WHERE follower_id = ?').get(userId) as any).total;

    res.json({
      following,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取关注列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取用户的粉丝列表
router.get('/followers/:userId', optionalAuth, (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: '无效的用户ID' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const followers = db
      .prepare(
        `
        SELECT 
          u.id,
          u.username,
          u.avatar,
          u.bio,
          u.points,
          u.level,
          f.created_at as followed_at
        FROM follows f
        LEFT JOIN users u ON f.follower_id = u.id
        WHERE f.following_id = ?
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `
      )
      .all(userId, limit, offset) as any[];

    const total = (db.prepare('SELECT COUNT(*) as total FROM follows WHERE following_id = ?').get(userId) as any).total;

    res.json({
      followers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取粉丝列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 检查是否关注了某个用户
router.get('/check/:userId', authenticateToken, (req: AuthRequest, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    if (isNaN(targetUserId)) {
      return res.status(400).json({ error: '无效的用户ID' });
    }

    const follow = db
      .prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?')
      .get(req.userId, targetUserId) as any;

    res.json({ is_following: !!follow });
  } catch (error) {
    console.error('检查关注状态错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取用户的关注和粉丝数量
router.get('/stats/:userId', optionalAuth, (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: '无效的用户ID' });
    }

    const followingCount = (db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?').get(userId) as any)
      .count;
    const followersCount = (db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(userId) as any)
      .count;

    let is_following = false;
    if (req.userId && req.userId !== userId) {
      const follow = db
        .prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?')
        .get(req.userId, userId) as any;
      is_following = !!follow;
    }

    res.json({
      following_count: followingCount,
      followers_count: followersCount,
      is_following,
    });
  } catch (error) {
    console.error('获取关注统计错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;

