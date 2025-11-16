# OnlyTalk - 畅所欲言论坛

一个功能丰富、界面炫酷的现代化BBS论坛系统，包含用户注册登录、发帖、评论、点赞、收藏、搜索等完整功能。

## ✨ 特色功能

- 🎨 **炫酷UI设计** - 渐变背景、动画效果、现代化卡片设计
- ❤️ **点赞系统** - 支持帖子和评论点赞，实时更新
- ⭐ **收藏功能** - 收藏喜欢的帖子，方便随时查看
- 🔍 **搜索功能** - 快速搜索帖子标题和内容
- 🔥 **热门帖子** - 基于浏览量、点赞数、评论数的智能推荐
- 🏆 **积分等级系统** - 发帖、评论、获得点赞都能获得积分，提升等级
- 💬 **评论系统** - 支持回复评论，形成讨论链
- 📱 **响应式设计** - 完美适配各种设备

## 技术栈

### 后端
- Node.js + Express + TypeScript
- SQLite 数据库
- JWT 认证
- bcryptjs 密码加密

### 前端
- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Axios

## 功能特性

### 用户功能
- ✅ 用户注册和登录（注册即送10积分）
- ✅ JWT 身份认证
- ✅ 用户个人资料（显示积分、等级、收藏）
- ✅ 积分等级系统（发帖+5分，评论+2分，获得点赞+1分）
- ✅ 等级计算（每100积分升1级）

### 帖子功能
- ✅ 帖子发布、编辑、删除
- ✅ 帖子分类管理
- ✅ 帖子列表分页
- ✅ 帖子详情查看
- ✅ 帖子点赞和收藏
- ✅ 热门帖子推荐（基于7天内的热度）
- ✅ 帖子搜索（标题和内容）

### 评论功能
- ✅ 评论发布、编辑、删除
- ✅ 评论回复（支持回复评论）
- ✅ 评论点赞
- ✅ 评论通知（回复时自动通知）

### UI特性
- ✅ 渐变背景动画
- ✅ 卡片式设计
- ✅ 悬停动画效果
- ✅ 响应式布局
- ✅ 现代化配色方案

## 快速开始

### 安装依赖

```bash
# 安装所有依赖（根目录、后端、前端）
npm run install:all
```

或者分别安装：

```bash
# 根目录
npm install

# 后端
cd server
npm install

# 前端
cd client
npm install
```

### 配置环境变量

复制后端环境变量示例文件：

```bash
cd server
cp .env.example .env
```

编辑 `.env` 文件，设置 `JWT_SECRET`（生产环境请使用强密钥）。

### 运行项目

#### 方式一：同时运行前后端（推荐）

在根目录运行：

```bash
npm run dev
```

#### 方式二：分别运行

**启动后端服务：**
```bash
cd server
npm run dev
```
后端服务运行在 http://localhost:3001

**启动前端服务：**
```bash
cd client
npm run dev
```
前端服务运行在 http://localhost:3000

### 构建生产版本

```bash
# 构建后端
npm run build:server

# 构建前端
npm run build:client
```

## 项目结构

```
onlytalk/
├── server/                 # 后端服务
│   ├── src/
│   │   ├── database/      # 数据库相关
│   │   ├── middleware/    # 中间件
│   │   ├── routes/        # 路由
│   │   │   ├── auth.ts    # 认证路由
│   │   │   ├── posts.ts   # 帖子路由
│   │   │   ├── comments.ts # 评论路由
│   │   │   ├── categories.ts # 分类路由
│   │   │   ├── likes.ts   # 点赞路由
│   │   │   ├── favorites.ts # 收藏路由
│   │   │   └── search.ts  # 搜索路由
│   │   └── index.ts       # 入口文件
│   ├── data/              # 数据库文件（自动生成）
│   └── package.json
├── client/                # 前端应用
│   ├── src/
│   │   ├── components/    # 组件
│   │   │   └── Layout.tsx # 布局组件
│   │   ├── contexts/      # Context
│   │   │   └── AuthContext.tsx # 认证上下文
│   │   ├── pages/         # 页面
│   │   │   ├── Home.tsx   # 首页
│   │   │   ├── PostDetail.tsx # 帖子详情
│   │   │   ├── CreatePost.tsx # 创建帖子
│   │   │   ├── Profile.tsx # 个人资料
│   │   │   ├── Login.tsx  # 登录
│   │   │   └── Register.tsx # 注册
│   │   └── main.tsx       # 入口文件
│   └── package.json
└── package.json           # 根目录配置
```

## API 接口

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息（需要认证）

### 帖子相关
- `GET /api/posts` - 获取帖子列表（支持分页和分类筛选）
- `GET /api/posts/hot` - 获取热门帖子
- `GET /api/posts/:id` - 获取帖子详情
- `POST /api/posts` - 创建帖子（需要认证）
- `PUT /api/posts/:id` - 更新帖子（需要认证）
- `DELETE /api/posts/:id` - 删除帖子（需要认证）

### 评论相关
- `GET /api/comments/post/:postId` - 获取帖子的评论列表
- `POST /api/comments` - 创建评论（需要认证）
- `PUT /api/comments/:id` - 更新评论（需要认证）
- `DELETE /api/comments/:id` - 删除评论（需要认证）

### 点赞相关
- `POST /api/likes/posts/:postId` - 点赞/取消点赞帖子（需要认证）
- `POST /api/likes/comments/:commentId` - 点赞/取消点赞评论（需要认证）
- `GET /api/likes/posts/:postId/status` - 检查帖子点赞状态（需要认证）

### 收藏相关
- `POST /api/favorites/posts/:postId` - 收藏/取消收藏帖子（需要认证）
- `GET /api/favorites` - 获取收藏列表（需要认证）
- `GET /api/favorites/posts/:postId/status` - 检查帖子收藏状态（需要认证）

### 搜索相关
- `GET /api/search/posts?q=关键词` - 搜索帖子

### 分类相关
- `GET /api/categories` - 获取所有分类
- `GET /api/categories/:id` - 获取分类详情

## 数据库结构

- **users** - 用户表（包含积分、等级字段）
- **categories** - 分类表
- **posts** - 帖子表
- **comments** - 评论表
- **post_likes** - 帖子点赞表
- **comment_likes** - 评论点赞表
- **favorites** - 收藏表
- **notifications** - 通知表

## 积分系统

- 注册：+10 积分
- 发帖：+5 积分
- 评论：+2 积分
- 获得点赞：+1 积分
- 等级计算：每100积分升1级

## 开发说明

1. 数据库文件会自动创建在 `server/data/bbs.db`
2. 首次运行会自动创建表结构和默认分类
3. 前端通过代理访问后端API（开发环境）
4. 生产环境需要配置CORS和API地址
5. 所有新表会在首次运行时自动创建

## 许可证

MIT
