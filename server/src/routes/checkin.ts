import express from 'express';
import { db } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 每日签到
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    // 创建签到表（如果不存在）
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS daily_checkins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          checkin_date DATE NOT NULL,
          consecutive_days INTEGER DEFAULT 1,
          points_earned INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, checkin_date)
        )
      `);
    } catch (e) {}

    // 检查今天是否已签到
    try {
      const todayCheckin = db
        .prepare('SELECT * FROM daily_checkins WHERE user_id = ? AND checkin_date = ?')
        .get(userId, today) as any;

      if (todayCheckin) {
        return res.status(400).json({ error: '今天已经签到过了' });
      }
    } catch (e: any) {
      if (!e.message.includes('no such table')) {
        throw e;
      }
    }

    // 获取昨天的签到记录
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let consecutiveDays = 1;
    try {
      const yesterdayCheckin = db
        .prepare('SELECT consecutive_days FROM daily_checkins WHERE user_id = ? AND checkin_date = ?')
        .get(userId, yesterdayStr) as any;
      if (yesterdayCheckin) {
        consecutiveDays = yesterdayCheckin.consecutive_days + 1;
      }
    } catch (e) {}

    // 计算奖励积分
    let pointsEarned = 10;
    if (consecutiveDays >= 7) {
      pointsEarned = 20;
    } else if (consecutiveDays >= 30) {
      pointsEarned = 50;
    } else if (consecutiveDays >= 100) {
      pointsEarned = 100;
    }

    // 记录签到
    db.prepare(
      'INSERT INTO daily_checkins (user_id, checkin_date, consecutive_days, points_earned) VALUES (?, ?, ?, ?)'
    ).run(userId, today, consecutiveDays, pointsEarned);

    // 增加用户积分
    db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(pointsEarned, userId);

    // 更新用户等级
    const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as any;
    const newLevel = Math.floor(user.points / 30) + 1;
    db.prepare('UPDATE users SET level = ? WHERE id = ?').run(newLevel, userId);

    res.json({
      success: true,
      message: '签到成功',
      checkin: {
        date: today,
        consecutive_days: consecutiveDays,
        points_earned: pointsEarned,
      },
    });
  } catch (error) {
    console.error('签到错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取签到状态
router.get('/status', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    try {
      const todayCheckin = db
        .prepare('SELECT * FROM daily_checkins WHERE user_id = ? AND checkin_date = ?')
        .get(userId, today) as any;

      let consecutiveDays = 0;
      if (todayCheckin) {
        consecutiveDays = todayCheckin.consecutive_days;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        try {
          const yesterdayCheckin = db
            .prepare('SELECT consecutive_days FROM daily_checkins WHERE user_id = ? AND checkin_date = ?')
            .get(userId, yesterdayStr) as any;
          if (yesterdayCheckin) {
            consecutiveDays = yesterdayCheckin.consecutive_days;
          }
        } catch (e) {}
      }

      res.json({
        checked_in_today: !!todayCheckin,
        consecutive_days: consecutiveDays,
        today_checkin: todayCheckin,
      });
    } catch (error: any) {
      if (error.message.includes('no such table')) {
        res.json({
          checked_in_today: false,
          consecutive_days: 0,
          today_checkin: null,
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('获取签到状态错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;



