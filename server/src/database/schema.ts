import Database from 'better-sqlite3';

// 数据库迁移函数
function migrateDatabase(db: Database.Database) {
  try {
    // 检查users表是否存在points列
    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
    const columns = tableInfo.map((col: any) => col.name);
    
    // 添加points列（如果不存在）
    if (!columns.includes('points')) {
      console.log('迁移: 添加points列到users表');
      db.exec('ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0');
      // 为现有用户设置默认积分
      db.exec('UPDATE users SET points = 10 WHERE points IS NULL OR points = 0');
    }
    
    // 添加level列（如果不存在）
    if (!columns.includes('level')) {
      console.log('迁移: 添加level列到users表');
      db.exec('ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1');
      // 根据积分计算现有用户的等级
      db.exec(`
        UPDATE users 
        SET level = CAST((points / 100) AS INTEGER) + 1 
        WHERE level IS NULL OR level = 1
      `);
    }
    
    // 添加bio列（如果不存在）
    if (!columns.includes('bio')) {
      console.log('迁移: 添加bio列到users表');
      db.exec('ALTER TABLE users ADD COLUMN bio TEXT');
    }
    
    console.log('数据库迁移完成');
  } catch (error) {
    console.error('数据库迁移错误:', error);
    // 迁移失败不应该阻止应用启动
  }
}

export function initTables(db: Database.Database) {
  // 先执行迁移
  migrateDatabase(db);
  // 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      role TEXT DEFAULT 'user',
      points INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 分类表
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 帖子表
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      category_id INTEGER,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      is_pinned INTEGER DEFAULT 0,
      is_locked INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  // 评论表
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      post_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      parent_id INTEGER,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    )
  `);

  // 帖子点赞表
  db.exec(`
    CREATE TABLE IF NOT EXISTS post_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(post_id, user_id)
    )
  `);

  // 评论点赞表
  db.exec(`
    CREATE TABLE IF NOT EXISTS comment_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comment_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(comment_id, user_id)
    )
  `);

  // 收藏表
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(post_id, user_id)
    )
  `);

  // 通知表
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      related_id INTEGER,
      related_type TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 创建索引以提高查询性能
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
    CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
    CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_post_id ON favorites(post_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
    CREATE INDEX IF NOT EXISTS idx_posts_views ON posts(views);
    CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes);
  `);

  // 插入默认分类
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (categoryCount.count === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
    insertCategory.run('技术讨论', '技术相关话题讨论');
    insertCategory.run('生活闲聊', '生活日常话题');
    insertCategory.run('问题求助', '遇到问题需要帮助');
    insertCategory.run('资源分享', '分享有用的资源');
  }
}

