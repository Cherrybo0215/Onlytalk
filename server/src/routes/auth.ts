import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { db } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 注册
router.post(
  '/register',
  [
    body('username').isLength({ min: 3, max: 20 }).withMessage('用户名长度必须在3-20个字符之间'),
    body('email').isEmail().withMessage('请输入有效的邮箱地址'),
    body('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // 检查用户名是否已存在
      const checkUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?');
      let existingUser;
      try {
        existingUser = checkUser.get(username, email);
      } catch (err: any) {
        console.error('查询用户失败:', err);
        console.error('错误详情:', err.message);
        console.error('错误堆栈:', err.stack);
        return res.status(500).json({ 
          error: '数据库查询失败',
          message: err.message,
          details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
      }
      if (existingUser) {
        return res.status(400).json({ error: '用户名或邮箱已存在' });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户（注册奖励10积分）
      let result;
      try {
        const insertUser = db.prepare('INSERT INTO users (username, email, password, points) VALUES (?, ?, ?, 10)');
        result = insertUser.run(username, email, hashedPassword);
      } catch (err: any) {
        console.error('插入用户失败:', err);
        console.error('错误详情:', err.message);
        return res.status(500).json({ 
          error: '创建用户失败',
          message: err.message,
          details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
      }

      const userId = result.lastInsertRowid as number;

      // 生成JWT令牌
      const token = jwt.sign(
        { userId, username, email, role: 'user' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: '注册成功',
        token,
        user: {
          id: userId,
          username,
          email,
        },
      });
    } catch (error: any) {
      console.error('注册错误:', error);
      res.status(500).json({ 
        error: '服务器错误',
        message: error?.message || '未知错误',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      });
    }
  }
);

// 登录
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('请输入用户名或邮箱'),
    body('password').notEmpty().withMessage('请输入密码'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // 查找用户（支持用户名或邮箱登录）
      const user = db
        .prepare('SELECT * FROM users WHERE username = ? OR email = ?')
        .get(username, username) as any;

      if (!user) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      // 生成JWT令牌
      const token = jwt.sign(
        { userId: user.id, username: user.username, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        message: '登录成功',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({ error: '服务器错误' });
    }
  }
);

// 获取当前用户信息
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  try {
    const user = db.prepare('SELECT id, username, email, avatar, role, points, level, bio, created_at FROM users WHERE id = ?').get(req.userId) as any;
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 计算等级（每100积分升1级）
    const calculatedLevel = Math.floor((user.points || 0) / 100) + 1;
    if (calculatedLevel !== user.level) {
      db.prepare('UPDATE users SET level = ? WHERE id = ?').run(calculatedLevel, req.userId);
      user.level = calculatedLevel;
    }
    
    res.json(user);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;

