# OnlyTalk - 畅所欲言论坛

一个功能丰富、界面现代化的BBS论坛系统，支持用户注册登录、发帖、评论、点赞、收藏、搜索、文件上传等完整功能。

## ✨ 核心功能

### 📝 内容管理
- **发帖/编辑/删除** - 完整的帖子管理功能
- **评论/回复/删除** - 支持嵌套回复的评论系统
- **文件上传** - 支持图片、视频、文档等多种格式
- **分类管理** - 按分类浏览和筛选帖子

### ❤️ 互动功能
- **点赞系统** - 帖子和评论点赞
- **收藏功能** - 收藏喜欢的帖子
- **关注/粉丝** - 关注感兴趣的用户
- **搜索功能** - 快速搜索帖子内容

### 🏆 积分系统
- **积分获取** - 注册+10，发帖+5，评论+2，获赞+1，每日签到+10
- **等级升级** - 每30积分升1级（降低升级难度）
- **等级称号** - 新手、初级、中级、高级、大师
- **积分商城** - 用积分购买道具和徽章
- **积分打赏** - 给喜欢的帖子/评论打赏积分
- **排行榜** - 积分和等级排行榜

### 🎨 界面特色
- **现代化设计** - 渐变背景、毛玻璃效果、流畅动画
- **黑夜模式** - 完整的深色模式支持，一键切换
- **响应式布局** - 完美适配桌面、平板、手机
- **Emoji支持** - 发帖和评论时轻松添加表情

## 🚀 快速开始

### 安装依赖

```bash
npm run install:all
```

### 配置环境

```bash
cd server
cp .env.example .env
# 编辑 .env 文件，设置 JWT_SECRET
```

### 运行项目

```bash
# 同时运行前后端
npm run dev

# 或分别运行
# 后端: cd server && npm run dev (端口 3001)
# 前端: cd client && npm run dev (端口 3000)
```

## 📁 项目结构

```
onlytalk/
├── server/          # 后端服务 (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── routes/  # API路由
│   │   ├── database/# 数据库配置
│   │   └── middleware/# 中间件
│   └── uploads/     # 上传文件存储
├── client/          # 前端应用 (React + TypeScript + Vite)
│   └── src/
│       ├── pages/   # 页面组件
│       ├── components/# UI组件
│       └── contexts/# 状态管理
└── README.md
```

## 🔧 技术栈

**后端**
- Node.js + Express + TypeScript
- SQLite 数据库
- JWT 认证
- Multer 文件上传

**前端**
- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Axios

## 📋 主要API

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户

### 帖子
- `GET /api/posts` - 获取帖子列表
- `GET /api/posts/:id` - 获取帖子详情
- `POST /api/posts` - 创建帖子
- `PUT /api/posts/:id` - 更新帖子
- `DELETE /api/posts/:id` - 删除帖子

### 评论
- `GET /api/comments/post/:postId` - 获取评论列表
- `POST /api/comments` - 创建评论
- `DELETE /api/comments/:id` - 删除评论

### 其他
- `POST /api/upload/multiple` - 文件上传
- `POST /api/likes/posts/:id` - 点赞帖子
- `POST /api/favorites/posts/:id` - 收藏帖子
- `GET /api/search/posts?q=关键词` - 搜索帖子
- `POST /api/follows/:userId` - 关注用户

## 💡 积分系统说明

### 积分获取
- 注册：+10 积分
- 发帖：+5 积分
- 评论：+2 积分
- 获得点赞：+1 积分
- 每日签到：+10 积分（连续签到有额外奖励）

### 等级计算
- **每30积分升1级**（降低升级难度）
- 等级称号：
  - Lv.1-4: 新手
  - Lv.5-9: 初级
  - Lv.10-19: 中级
  - Lv.20-29: 高级
  - Lv.30+: 大师

## 🌙 功能特性

- ✅ 用户注册登录（JWT认证）
- ✅ 帖子发布、编辑、删除
- ✅ 评论发布、回复、删除
- ✅ 点赞和收藏
- ✅ 文件上传（图片、视频、文档）
- ✅ 搜索和热门帖子
- ✅ 关注/粉丝系统
- ✅ 积分等级系统
- ✅ 积分商城和打赏
- ✅ 每日签到
- ✅ 排行榜
- ✅ 黑夜模式
- ✅ 响应式设计
- ✅ Emoji表情支持

## 📝 开发说明

1. 数据库文件自动创建在 `server/data/bbs.db`
2. 上传文件存储在 `server/uploads/` 目录
3. 首次运行会自动创建表结构和默认分类
4. 数据库迁移会自动执行

## 📄 许可证

MIT

## 📅 更新日志

### v4.1.0 (最新)
- 🐛 修复文件上传功能（添加token认证）
- ⚡ 降低升级难度（从100积分改为30积分升1级）
- 📝 优化README，使其更简洁易读
- ✨ 添加帖子编辑和删除功能
- ✨ 添加评论删除功能

### v4.0.0
- ✨ 添加文件上传功能
- ✨ 添加黑夜模式
- 🎨 界面进一步优化

### v3.0.0
- ✨ 添加关注/粉丝功能
- ✨ 优化评论回复界面
- ✨ 集成Emoji选择器

### v2.0.0
- ✨ 添加Emoji表情系统
- ✨ 添加骨架屏加载
- ✨ 优化表单验证

### v1.0.0
- ✨ 基础功能实现
