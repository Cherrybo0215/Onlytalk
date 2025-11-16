import express from 'express';
import { db } from '../database';

const router = express.Router();

// 积分排行榜
router.get('/points', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const offsetNum = parseInt(offset as string) || 0;

    const leaderboard = db
      .prepare(
        `
        SELECT 
          id,
          username,
          points,
          level,
          avatar,
          (SELECT COUNT(*) FROM posts WHERE author_id = users.id) as post_count,
          (SELECT COUNT(*) FROM comments WHERE author_id = users.id) as comment_count
        FROM users
        ORDER BY points DESC, level DESC
        LIMIT ? OFFSET ?
      `
      )
      .all(limitNum, offsetNum);

    res.json({ leaderboard });
  } catch (error) {
    console.error('获取排行榜错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 等级排行榜
router.get('/level', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const offsetNum = parseInt(offset as string) || 0;

    const leaderboard = db
      .prepare(
        `
        SELECT 
          id,
          username,
          points,
          level,
          avatar,
          (SELECT COUNT(*) FROM posts WHERE author_id = users.id) as post_count,
          (SELECT COUNT(*) FROM comments WHERE author_id = users.id) as comment_count
        FROM users
        ORDER BY level DESC, points DESC
        LIMIT ? OFFSET ?
      `
      )
      .all(limitNum, offsetNum);

    res.json({ leaderboard });
  } catch (error) {
    console.error('获取等级排行榜错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;

