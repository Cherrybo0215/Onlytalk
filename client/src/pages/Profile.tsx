import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  points: number;
  level: number;
  bio: string | null;
  created_at: string;
}

interface Favorite {
  id: number;
  title: string;
  author_name: string;
  created_at: string;
  favorited_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites'>('profile');

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [authUser, navigate]);

  useEffect(() => {
    if (activeTab === 'favorites' && user) {
      fetchFavorites();
    }
  }, [activeTab, user]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('/api/favorites');
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error('获取收藏列表失败:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  const getLevelColor = (level: number) => {
    if (level < 5) return 'from-gray-400 to-gray-600';
    if (level < 10) return 'from-green-400 to-green-600';
    if (level < 20) return 'from-blue-400 to-blue-600';
    if (level < 30) return 'from-purple-400 to-purple-600';
    return 'from-yellow-400 to-yellow-600';
  };

  const getLevelName = (level: number) => {
    if (level < 5) return '新手';
    if (level < 10) return '初级';
    if (level < 20) return '中级';
    if (level < 30) return '高级';
    return '大师';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-2 text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500">获取用户信息失败</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      {/* 用户信息卡片 */}
      <div className="card p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl hover:scale-110 transition-transform duration-300">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500 border-3 sm:border-4 border-white shadow-lg"></div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {user.username}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
              <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-white text-xs sm:text-sm font-semibold bg-gradient-to-r ${getLevelColor(user.level)} shadow-lg`}>
                Lv.{user.level} {getLevelName(user.level)}
              </span>
              <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 font-medium border border-yellow-200">
                ⭐ {user.points} 积分
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">{user.points}</div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">积分</div>
          </div>
          <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">Lv.{user.level}</div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">等级</div>
          </div>
          <div className="p-4 sm:p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{user.role === 'admin' ? '👑' : '👤'}</div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">{user.role === 'admin' ? '管理员' : '普通用户'}</div>
          </div>
          <div className="p-4 sm:p-5 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">{favorites.length}</div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">收藏</div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-gray-200/50">
          <div className="p-3 sm:p-4 bg-gray-50/50 rounded-xl">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
              <span>📧</span>
              <span>邮箱</span>
            </label>
            <p className="text-gray-900 font-medium text-sm sm:text-base">{user.email}</p>
          </div>
          {user.bio && (
            <div className="p-3 sm:p-4 bg-gray-50/50 rounded-xl">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
                <span>📝</span>
                <span>个人简介</span>
              </label>
              <p className="text-gray-900 text-sm sm:text-base">{user.bio}</p>
            </div>
          )}
          <div className="p-3 sm:p-4 bg-gray-50/50 rounded-xl">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
              <span>📅</span>
              <span>注册时间</span>
            </label>
            <p className="text-gray-900 font-medium text-sm sm:text-base">{formatDate(user.created_at)}</p>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-200/50 bg-gradient-to-r from-purple-50/30 to-pink-50/30">
          <nav className="flex space-x-1 sm:space-x-2 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-semibold transition-all duration-300 text-sm sm:text-base ${
                activeTab === 'profile'
                  ? 'border-purple-500 text-purple-600 bg-white/50'
                  : 'border-transparent text-gray-500 hover:text-purple-600 hover:bg-white/30'
              }`}
            >
              👤 个人资料
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-semibold transition-all duration-300 text-sm sm:text-base ${
                activeTab === 'favorites'
                  ? 'border-purple-500 text-purple-600 bg-white/50'
                  : 'border-transparent text-gray-500 hover:text-purple-600 hover:bg-white/30'
              }`}
            >
              ⭐ 我的收藏 ({favorites.length})
            </button>
          </nav>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'favorites' ? (
            <div className="space-y-3 sm:space-y-4">
              {favorites.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-5xl sm:text-6xl mb-4">⭐</div>
                  <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">还没有收藏任何帖子</p>
                  <Link to="/" className="text-purple-600 hover:text-purple-700 font-medium hover:underline inline-flex items-center gap-2">
                    去逛逛 <span>→</span>
                  </Link>
                </div>
              ) : (
                favorites.map((favorite, index) => (
                  <Link
                    key={favorite.id}
                    to={`/post/${favorite.id}`}
                    className="block p-4 sm:p-5 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 border border-gray-200/50 hover:border-purple-200 hover:shadow-md group animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 group-hover:text-purple-600 transition-colors line-clamp-2 text-sm sm:text-base">
                      {favorite.title}
                    </h3>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <span>👤</span>
                        <span>{favorite.author_name}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span>⭐</span>
                        <span>收藏于: {formatDate(favorite.favorited_at)}</span>
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-gray-50/50 rounded-xl">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
                  <span>👤</span>
                  <span>用户名</span>
                </label>
                <p className="text-gray-900 font-medium text-sm sm:text-base">{user.username}</p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50/50 rounded-xl">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
                  <span>📧</span>
                  <span>邮箱</span>
                </label>
                <p className="text-gray-900 font-medium text-sm sm:text-base">{user.email}</p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50/50 rounded-xl">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
                  <span>{user.role === 'admin' ? '👑' : '👤'}</span>
                  <span>角色</span>
                </label>
                <p className="text-gray-900 font-medium text-sm sm:text-base">{user.role === 'admin' ? '管理员' : '普通用户'}</p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50/50 rounded-xl">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
                  <span>📅</span>
                  <span>注册时间</span>
                </label>
                <p className="text-gray-900 font-medium text-sm sm:text-base">{formatDate(user.created_at)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
