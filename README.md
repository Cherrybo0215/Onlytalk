# OnlyTalk - 畅所欲言论坛

一个功能丰富、界面炫酷的现代化BBS论坛系统，包含用户注册登录、发帖、评论、点赞、收藏、搜索、Emoji表情等完整功能。

## ✨ 特色功能

### 🎨 现代化UI设计
- **渐变背景动画** - 动态渐变背景，15秒循环动画
- **毛玻璃效果卡片** - 现代化的半透明卡片设计
- **流畅动画效果** - 淡入、滑入、缩放等丰富的交互动画
- **自定义滚动条** - 渐变色滚动条，提升视觉体验
- **骨架屏加载** - 优雅的加载状态展示

### 😊 Emoji表情系统
- **Emoji选择器** - 支持多分类表情选择（表情、手势、物品、符号、常用）
- **智能插入** - 在光标位置插入表情，支持文本编辑
- **评论表情** - 评论和发帖时轻松添加表情
- **响应式设计** - 移动端完美适配

### ❤️ 互动功能
- **点赞系统** - 支持帖子和评论点赞，实时更新
- **收藏功能** - 收藏喜欢的帖子，方便随时查看
- **评论系统** - 支持回复评论，形成讨论链
- **通知系统** - 点赞、评论、回复自动通知

### 🔍 内容发现
- **搜索功能** - 快速搜索帖子标题和内容
- **热门帖子** - 基于浏览量、点赞数、评论数的智能推荐
- **分类筛选** - 按分类浏览帖子
- **分页浏览** - 流畅的分页体验

### 🏆 积分等级系统
- **积分获取** - 注册+10，发帖+5，评论+2，获赞+1
- **等级计算** - 每100积分升1级
- **等级显示** - 用户资料显示等级和积分
- **等级称号** - 新手、初级、中级、高级、大师

### 📱 响应式设计
- **完美适配** - 支持桌面、平板、手机各种设备
- **移动端优化** - 导航栏、按钮、表单移动端优化
- **触摸友好** - 适合触摸操作的按钮大小和间距

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
- ✅ 密码强度指示器
- ✅ 密码可见性切换

### 帖子功能
- ✅ 帖子发布、编辑、删除
- ✅ 帖子分类管理
- ✅ 帖子列表分页
- ✅ 帖子详情查看
- ✅ 帖子点赞和收藏
- ✅ 热门帖子推荐（基于7天内的热度）
- ✅ 帖子搜索（标题和内容）
- ✅ Emoji表情支持

### 评论功能
- ✅ 评论发布、编辑、删除
- ✅ 评论回复（支持回复评论）
- ✅ 评论点赞
- ✅ 评论通知（回复时自动通知）
- ✅ Emoji表情支持

### UI特性
- ✅ 渐变背景动画
- ✅ 卡片式设计（毛玻璃效果）
- ✅ 悬停动画效果
- ✅ 响应式布局
- ✅ 现代化配色方案
- ✅ 骨架屏加载
- ✅ 表单实时验证
- ✅ 自定义滚动条
- ✅ 文本选择高亮

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
│   │   │   ├── index.ts   # 数据库连接
│   │   │   └── schema.ts  # 数据库表结构（含迁移）
│   │   ├── middleware/    # 中间件
│   │   │   └── auth.ts    # JWT认证中间件
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
│   │   │   ├── Layout.tsx # 布局组件
│   │   │   ├── EmojiPicker.tsx # Emoji选择器
│   │   │   └── LoadingSkeleton.tsx # 骨架屏组件
│   │   ├── contexts/      # Context
│   │   │   └── AuthContext.tsx # 认证上下文
│   │   ├── pages/         # 页面
│   │   │   ├── Home.tsx   # 首页
│   │   │   ├── PostDetail.tsx # 帖子详情
│   │   │   ├── CreatePost.tsx # 创建帖子
│   │   │   ├── Profile.tsx # 个人资料
│   │   │   ├── Login.tsx  # 登录
│   │   │   └── Register.tsx # 注册
│   │   ├── index.css      # 全局样式
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

- **注册**：+10 积分
- **发帖**：+5 积分
- **评论**：+2 积分
- **获得点赞**：+1 积分
- **等级计算**：每100积分升1级
- **等级称号**：
  - Lv.1-4: 新手
  - Lv.5-9: 初级
  - Lv.10-19: 中级
  - Lv.20-29: 高级
  - Lv.30+: 大师

## UI组件说明

### EmojiPicker
Emoji选择器组件，支持多分类表情选择：
- 表情、手势、物品、符号、常用等分类
- 点击表情自动插入到光标位置
- 响应式设计，移动端友好

### LoadingSkeleton
骨架屏加载组件：
- `PostSkeleton` - 帖子列表骨架屏
- `CommentSkeleton` - 评论骨架屏
- `CardSkeleton` - 通用卡片骨架屏

## 开发说明

1. 数据库文件会自动创建在 `server/data/bbs.db`
2. 首次运行会自动创建表结构和默认分类
3. 数据库迁移会自动执行，添加新字段到现有表
4. 前端通过代理访问后端API（开发环境）
5. 生产环境需要配置CORS和API地址
6. 所有新表会在首次运行时自动创建

## 设计特色

### 配色方案
- 主色调：紫色到粉色的渐变（#667eea → #764ba2 → #f093fb）
- 强调色：蓝色、红色、黄色
- 背景：动态渐变背景

### 动画效果
- 渐变背景：15秒循环动画
- 淡入动画：页面加载时
- 滑入动画：列表项出现时
- 悬停效果：按钮和卡片悬停
- 点击反馈：按钮点击动画

### 响应式断点
- 移动端：< 640px
- 平板：640px - 1024px
- 桌面：> 1024px

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 许可证

MIT

## 更新日志

### v2.0.0 (最新)
- ✨ 添加Emoji表情选择器
- ✨ 添加骨架屏加载效果
- ✨ 优化表单设计和验证
- ✨ 添加密码强度指示器
- ✨ 优化响应式设计
- ✨ 添加更多动画效果
- ✨ 优化移动端体验
- 🎨 更新UI配色和样式

### v1.0.0
- ✨ 基础功能实现
- ✨ 用户注册登录
- ✨ 帖子发布和评论
- ✨ 点赞和收藏功能
- ✨ 搜索和热门帖子
- ✨ 积分等级系统
