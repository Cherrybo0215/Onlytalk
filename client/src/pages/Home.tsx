import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

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
    <div className="space-y-6 animate-fade-in">
      {/* 搜索栏 */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索帖子..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button type="submit" className="btn-primary">
            🔍 搜索
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
            🔥 热门
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
            📋 最新
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 侧边栏 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 分类 */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">📂 分类</h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setPage(1);
                    setShowHot(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                    selectedCategory === null && !showHot
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  全部
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
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.name} ({category.post_count})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 热门帖子 */}
          {hotPosts.length > 0 && (
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">🔥 热门</h2>
              <ul className="space-y-3">
                {hotPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      to={`/post/${post.id}`}
                      className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>❤️ {post.likes}</span>
                        <span>💬 {post.comment_count}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 主内容区 */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800">
                {showHot ? '🔥 热门帖子' : searchQuery ? `搜索结果: ${searchQuery}` : '📋 最新帖子'}
              </h1>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2">加载中...</p>
              </div>
            ) : (showHot ? hotPosts : posts).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">暂无帖子</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {(showHot ? hotPosts : posts).map((post, index) => (
                    <Link
                      key={post.id}
                      to={`/post/${post.id}`}
                      className="block p-6 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {post.is_pinned && (
                              <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full font-medium">
                                📌 置顶
                              </span>
                            )}
                            <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs rounded-full">
                              {post.category_name || '未分类'}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-purple-600 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              👤 {post.author_name}
                            </span>
                            <span className="flex items-center gap-1">
                              🕒 {formatDate(post.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              👁️ {post.views}
                            </span>
                            <span className="flex items-center gap-1">
                              💬 {post.comment_count}
                            </span>
                            <span className={`flex items-center gap-1 ${post.is_liked ? 'text-red-500' : ''}`}>
                              ❤️ {post.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {!showHot && totalPages > 1 && (
                  <div className="p-4 border-t border-gray-200 flex justify-center space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      上一页
                    </button>
                    <span className="px-4 py-2 flex items-center">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      下一页
                    </button>
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
