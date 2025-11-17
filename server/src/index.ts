import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 健康检查（放在最前面，确保最先注册）
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ 
    status: 'ok', 
    message: 'OnlyTalk API服务运行正常'
  });
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 初始化数据库
let dbInitialized = false;
try {
  initDatabase();
  dbInitialized = true;
  console.log('✅ 数据库初始化成功');
} catch (error: any) {
  console.error('❌ 数据库初始化失败:', error);
  console.error('错误详情:', error?.message);
  console.error('错误堆栈:', error?.stack);
  dbInitialized = false;
  console.warn('警告: 数据库初始化失败，某些功能可能无法使用');
}

// 在数据库初始化后再导入路由（避免路由导入时访问未初始化的数据库）
let authRoutes: any;
let postRoutes: any;
let commentRoutes: any;
let categoryRoutes: any;

let likesRoutes: any;
let favoritesRoutes: any;
let searchRoutes: any;
let shopRoutes: any;
let leaderboardRoutes: any;
let checkinRoutes: any;
let rewardsRoutes: any;
let followsRoutes: any;
let uploadRoutes: any;

if (dbInitialized) {
  authRoutes = require('./routes/auth').default;
  postRoutes = require('./routes/posts').default;
  commentRoutes = require('./routes/comments').default;
  categoryRoutes = require('./routes/categories').default;
  likesRoutes = require('./routes/likes').default;
  favoritesRoutes = require('./routes/favorites').default;
  searchRoutes = require('./routes/search').default;
  shopRoutes = require('./routes/shop').default;
  leaderboardRoutes = require('./routes/leaderboard').default;
  checkinRoutes = require('./routes/checkin').default;
  rewardsRoutes = require('./routes/rewards').default;
  followsRoutes = require('./routes/follows').default;
  uploadRoutes = require('./routes/upload').default;
}

// 数据库检查中间件（排除健康检查端点）
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path === '/api/health') {
    return next();
  }
  if (!dbInitialized && req.path.startsWith('/api/')) {
    return res.status(503).json({ 
      error: '数据库未初始化',
      message: '服务器正在初始化数据库，请稍后重试'
    });
  }
  next();
});

// 路由（只有在数据库初始化成功后才加载）
if (dbInitialized) {
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/likes', likesRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/shop', shopRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/checkin', checkinRoutes);
  app.use('/api/rewards', rewardsRoutes);
  app.use('/api/follows', followsRoutes);
  app.use('/api/upload', uploadRoutes);
} else {
  // 如果数据库未初始化，返回503错误
  app.use('/api/*', (req, res) => {
    res.status(503).json({ 
      error: '数据库未初始化',
      message: '服务器正在初始化数据库，请稍后重试'
    });
  });
}


// 全局错误处理中间件（必须在所有路由之后）
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('未处理的错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: err.message || '未知错误',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`数据库初始化状态: ${dbInitialized ? '✅ 已初始化' : '❌ 未初始化'}`);
  console.log(`\n📱 移动端访问地址:`);
  console.log(`   前端: http://192.168.3.10:3000`);
  console.log(`   后端: http://192.168.3.10:3001`);
  console.log(`\n💡 提示: 确保手机和电脑在同一WiFi网络下`);
});

