import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CheckInButton from '../components/CheckInButton';

interface Category {
  id: number;
  name: string;
  description: string;
  post_count: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author_name: string;
  category_name: string;
  views: number;
  likes: number;
  comment_count: number;
  is_pinned: number;
  created_at: string;
  is_liked?: number;
  is_favorited?: number;
}

export default function Home() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHot, setShowHot] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchHotPosts();
  }, []);

  useEffect(() => {
    if (!showHot) {
      fetchPosts();
    }
  }, [selectedCategory, page, showHot]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      const response = await axios.get('/api/posts', { params });
      setPosts(response.data.posts);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('获取帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotPosts = async () => {
    try {
      const response = await axios.get('/api/posts/hot', { params: { limit: 5 } });
      setHotPosts(response.data.posts);
    } catch (error) {
      console.error('获取热门帖子失败:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get('/api/search/posts', {
        params: { q: searchQuery, page: 1, limit: 20 },
      });
      setPosts(response.data.posts);
      setTotalPages(response.data.pagination.totalPages);
      setShowHot(false);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* 每日签到 */}
      <CheckInButton />
      
      {/* 搜索栏 */}
      <div className="card p-4 sm:p-6 shadow-xl">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索帖子、内容..."
              className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
            />
            <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
              🔍
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 sm:flex-none">
              <span className="hidden sm:inline">搜索</span>
              <span className="sm:hidden">🔍</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowHot(true);
                setSelectedCategory(null);
              }}
              className="btn-secondary"
            >
              <span className="hidden sm:inline">🔥 热门</span>
              <span className="sm:hidden">🔥</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowHot(false);
                setPage(1);
              }}
              className="btn-secondary"
            >
              <span className="hidden sm:inline">📋 最新</span>
              <span className="sm:hidden">📋</span>
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 侧边栏 */}
        <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
          {/* 分类 */}
          <div className="card p-4 sm:p-5">
            <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📂</span>
              <span>分类</span>
            </h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setPage(1);
                    setShowHot(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    selectedCategory === null && !showHot
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-gray-700 hover:scale-105'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>全部</span>
                    {selectedCategory === null && !showHot && <span>✓</span>}
                  </span>
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setPage(1);
                      setShowHot(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                        : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-gray-700 hover:scale-105'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-xs opacity-75">({category.post_count})</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 热门帖子 */}
          {hotPosts.length > 0 && (
            <div className="card p-4 sm:p-5">
              <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                <span className="text-2xl animate-pulse">🔥</span>
                <span>热门</span>
              </h2>
              <ul className="space-y-2 sm:space-y-3">
                {hotPosts.map((post, index) => (
                  <li key={post.id}>
                    <Link
                      to={`/post/${post.id}`}
                      className="block p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group border border-transparent hover:border-purple-200"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg font-bold text-purple-500 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">❤️ {post.likes}</span>
                            <span className="flex items-center gap-1">💬 {post.comment_count}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 主内容区 */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="card overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 flex-wrap">
                {showHot ? (
                  <>
                    <span className="text-2xl sm:text-3xl animate-pulse">🔥</span>
                    <span>热门帖子</span>
                  </>
                ) : searchQuery ? (
                  <>
                    <span className="text-xl sm:text-2xl">🔍</span>
                    <span>搜索结果: <span className="text-purple-600">{searchQuery}</span></span>
                  </>
                ) : (
                  <>
                    <span className="text-xl sm:text-2xl">📋</span>
                    <span>最新帖子</span>
                  </>
                )}
              </h1>
            </div>
            {loading ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-purple-200 border-t-purple-600"></div>
                <p className="mt-4 text-gray-500 text-lg">加载中...</p>
              </div>
            ) : (showHot ? hotPosts : posts).length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="text-5xl sm:text-6xl mb-4">📭</div>
                <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">暂无帖子</p>
                <p className="text-gray-500">快来发布第一个帖子吧！</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100/50">
                  {(showHot ? hotPosts : posts).map((post, index) => (
                    <Link
                      key={post.id}
                      to={`/post/${post.id}`}
                      className="block p-4 sm:p-6 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300 animate-slide-up border-b border-gray-100/50 last:border-0 group"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
                            {post.is_pinned && (
                              <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full font-semibold animate-pulse">
                                📌 置顶
                              </span>
                            )}
                            <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs rounded-full font-medium">
                              {post.category_name || '未分类'}
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
                              <span className="text-base">👤</span>
                              <span className="font-medium">{post.author_name}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="text-base">🕒</span>
                              <span>{formatDate(post.created_at)}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="text-base">👁️</span>
                              <span>{post.views}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="text-base">💬</span>
                              <span>{post.comment_count}</span>
                            </span>
                            <span className={`flex items-center gap-1.5 ${post.is_liked ? 'text-red-500 font-semibold' : ''}`}>
                              <span className="text-base">❤️</span>
                              <span>{post.likes}</span>
                            </span>
                          </div>
                        </div>
                        <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {!showHot && totalPages > 1 && (
                  <div className="p-4 sm:p-6 border-t border-gray-200/50 bg-gradient-to-r from-purple-50/30 to-pink-50/30">
                    <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 font-medium disabled:hover:scale-100 disabled:hover:shadow-none text-sm sm:text-base"
                      >
                        ← 上一页
                      </button>
                      <div className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm font-medium text-sm sm:text-base">
                        <span className="text-purple-600">{page}</span>
                        <span className="text-gray-400 mx-2">/</span>
                        <span className="text-gray-600">{totalPages}</span>
                      </div>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 font-medium disabled:hover:scale-100 disabled:hover:shadow-none text-sm sm:text-base"
                      >
                        下一页 →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
