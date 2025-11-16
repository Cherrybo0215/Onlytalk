import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 获取商城商品列表
router.get('/items', (req, res) => {
  try {
    // 检查表是否存在，如果不存在则创建并初始化
    try {
      const items = db.prepare('SELECT * FROM shop_items WHERE is_available = 1 ORDER BY price ASC').all();
      res.json({ items });
    } catch (error: any) {
      // 表不存在，创建表并初始化数据
      if (error.message.includes('no such table')) {
        db.exec(`
          CREATE TABLE IF NOT EXISTS shop_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price INTEGER NOT NULL,
            item_type TEXT NOT NULL,
            item_value TEXT,
            icon TEXT,
            is_available INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // 初始化商品
        const insertItem = db.prepare('INSERT INTO shop_items (name, description, price, item_type, item_value, icon) VALUES (?, ?, ?, ?, ?, ?)');
        insertItem.run('帖子置顶卡', '使用后帖子置顶24小时', 100, 'post_pin', '24', '📌');
        insertItem.run('帖子高亮卡', '使用后帖子标题高亮显示', 50, 'post_highlight', '7', '✨');
        insertItem.run('改名卡', '修改用户名一次', 200, 'rename', '1', '✏️');
        insertItem.run('VIP徽章', '显示VIP身份标识', 500, 'badge', 'VIP', '👑');
        insertItem.run('超级会员徽章', '显示超级会员身份', 1000, 'badge', 'SUPER', '⭐');
        
        const items = db.prepare('SELECT * FROM shop_items WHERE is_available = 1 ORDER BY price ASC').all();
        res.json({ items });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 购买商品
router.post(
  '/purchase',
  authenticateToken,
  [
    body('item_id').isInt().withMessage('商品ID必须是整数'),
  ],
  (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { item_id } = req.body;
      const userId = req.userId;

      // 获取商品信息
      const item = db.prepare('SELECT * FROM shop_items WHERE id = ? AND is_available = 1').get(item_id) as any;
      if (!item) {
        return res.status(404).json({ error: '商品不存在或已下架' });
      }

      // 检查用户积分
      const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as any;
      if (!user || user.points < item.price) {
        return res.status(400).json({ error: '积分不足' });
      }

      // 创建用户购买记录表（如果不存在）
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS user_purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            points_spent INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } catch (e) {}

      // 创建用户徽章表（如果不存在）
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS user_badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            badge_name TEXT NOT NULL,
            badge_icon TEXT,
            obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, badge_name)
          )
        `);
      } catch (e) {}

      // 处理不同类型的商品
      if (item.item_type === 'badge') {
        // 检查是否已拥有该徽章
        try {
          const existingBadge = db
            .prepare('SELECT id FROM user_badges WHERE user_id = ? AND badge_name = ?')
            .get(userId, item.item_value) as any;
          if (existingBadge) {
            return res.status(400).json({ error: '您已拥有该徽章' });
          }

          // 添加徽章
          db.prepare('INSERT INTO user_badges (user_id, badge_name, badge_icon) VALUES (?, ?, ?)').run(
            userId,
            item.item_value,
            item.icon
          );
        } catch (e: any) {
          if (!e.message.includes('UNIQUE constraint')) {
            throw e;
          }
          return res.status(400).json({ error: '您已拥有该徽章' });
        }
      }

      // 扣除积分
      db.prepare('UPDATE users SET points = points - ? WHERE id = ?').run(item.price, userId);

      // 记录购买
      db.prepare('INSERT INTO user_purchases (user_id, item_id, points_spent) VALUES (?, ?, ?)').run(
        userId,
        item_id,
        item.price
      );

      res.json({
        success: true,
        message: '购买成功',
        item: {
          id: item.id,
          name: item.name,
          type: item.item_type,
        },
      });
    } catch (error) {
      console.error('购买商品错误:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  }
);

// 获取用户徽章
router.get('/badges/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    try {
      const badges = db
        .prepare('SELECT badge_name, badge_icon, obtained_at FROM user_badges WHERE user_id = ? ORDER BY obtained_at DESC')
        .all(userId);
      res.json({ badges });
    } catch (error: any) {
      if (error.message.includes('no such table')) {
        res.json({ badges: [] });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('获取用户徽章错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;

