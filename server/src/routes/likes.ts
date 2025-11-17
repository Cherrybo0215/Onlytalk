import express from 'express';
import { db } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 点赞/取消点赞帖子
router.post('/posts/:postId', authenticateToken, (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      return res.status(400).json({ error: '无效的帖子ID' });
    }

    // 检查帖子是否存在
    const post = db.prepare('SELECT id, author_id FROM posts WHERE id = ?').get(postId) as any;
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    // 检查是否已点赞
    const existingLike = db
      .prepare('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?')
      .get(postId, req.userId) as any;

    if (existingLike) {
      // 取消点赞
      db.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(postId, req.userId);
      db.prepare('UPDATE posts SET likes = likes - 1 WHERE id = ?').run(postId);
      
      // 减少作者积分（如果点赞的是别人的帖子）
      if (post.author_id !== req.userId) {
        db.prepare('UPDATE users SET points = points - 1 WHERE id = ?').run(post.author_id);
        
        // 更新作者等级
        const author = db.prepare('SELECT points FROM users WHERE id = ?').get(post.author_id) as any;
        const newLevel = Math.floor(author.points / 30) + 1;
        db.prepare('UPDATE users SET level = ? WHERE id = ?').run(newLevel, post.author_id);
      }

      res.json({ liked: false, message: '已取消点赞' });
    } else {
      // 点赞
      db.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)').run(postId, req.userId);
      db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(postId);
      
      // 增加作者积分（如果点赞的是别人的帖子）
      if (post.author_id !== req.userId) {
        db.prepare('UPDATE users SET points = points + 1 WHERE id = ?').run(post.author_id);
        
        // 更新作者等级
        const author = db.prepare('SELECT points FROM users WHERE id = ?').get(post.author_id) as any;
        const newLevel = Math.floor(author.points / 30) + 1;
        db.prepare('UPDATE users SET level = ? WHERE id = ?').run(newLevel, post.author_id);
        
        // 创建通知
        const currentUser = db.prepare('SELECT username FROM users WHERE id = ?').get(req.userId) as any;
        db.prepare(
          'INSERT INTO notifications (user_id, type, title, content, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(
          post.author_id,
          'like',
          '收到新点赞',
          `${currentUser?.username || '有人'} 点赞了你的帖子`,
          postId,
          'post'
        );
      }

      res.json({ liked: true, message: '点赞成功' });
    }
  } catch (error) {
    console.error('点赞帖子错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 点赞/取消点赞评论
router.post('/comments/:commentId', authenticateToken, (req: AuthRequest, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    if (isNaN(commentId)) {
      return res.status(400).json({ error: '无效的评论ID' });
    }

    // 检查评论是否存在
    const comment = db.prepare('SELECT id, author_id FROM comments WHERE id = ?').get(commentId) as any;
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    // 检查是否已点赞
    const existingLike = db
      .prepare('SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?')
      .get(commentId, req.userId) as any;

    if (existingLike) {
      // 取消点赞
      db.prepare('DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?').run(commentId, req.userId);
      db.prepare('UPDATE comments SET likes = likes - 1 WHERE id = ?').run(commentId);
      res.json({ liked: false, message: '已取消点赞' });
    } else {
      // 点赞
      db.prepare('INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)').run(commentId, req.userId);
      db.prepare('UPDATE comments SET likes = likes + 1 WHERE id = ?').run(commentId);
      
      // 增加作者积分（如果点赞的是别人的评论）
      if (comment.author_id !== req.userId) {
        db.prepare('UPDATE users SET points = points + 1 WHERE id = ?').run(comment.author_id);
        
        // 更新作者等级
        const author = db.prepare('SELECT points FROM users WHERE id = ?').get(comment.author_id) as any;
        const newLevel = Math.floor(author.points / 30) + 1;
        db.prepare('UPDATE users SET level = ? WHERE id = ?').run(newLevel, comment.author_id);
      }

      res.json({ liked: true, message: '点赞成功' });
    }
  } catch (error) {
    console.error('点赞评论错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 检查用户是否已点赞帖子
router.get('/posts/:postId/status', authenticateToken, (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      return res.status(400).json({ error: '无效的帖子ID' });
    }

    const like = db
      .prepare('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?')
      .get(postId, req.userId) as any;

    res.json({ liked: !!like });
  } catch (error) {
    console.error('检查点赞状态错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;

