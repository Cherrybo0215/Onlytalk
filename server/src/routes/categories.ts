import express from 'express';
import { db } from '../database';

const router = express.Router();

// 获取所有分类
router.get('/', (req, res) => {
  try {
    const categories = db
      .prepare(
        `
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM posts WHERE category_id = c.id) as post_count
        FROM categories c
        ORDER BY c.created_at ASC
      `
      )
      .all();

    res.json(categories);
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取分类详情
router.get('/:id', (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: '无效的分类ID' });
    }

    const category = db
      .prepare(
        `
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM posts WHERE category_id = c.id) as post_count
        FROM categories c
        WHERE c.id = ?
      `
      )
      .get(categoryId) as any;

    if (!category) {
      return res.status(404).json({ error: '分类不存在' });
    }

    res.json(category);
  } catch (error) {
    console.error('获取分类详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;

