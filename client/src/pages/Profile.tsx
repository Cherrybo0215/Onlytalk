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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* 用户信息卡片 */}
      <div className="card p-8">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.username}</h1>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getLevelColor(user.level)}`}>
                Lv.{user.level} {getLevelName(user.level)}
              </span>
              <span className="text-gray-600">⭐ {user.points} 积分</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{user.points}</div>
            <div className="text-sm text-gray-600">积分</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">Lv.{user.level}</div>
            <div className="text-sm text-gray-600">等级</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{user.role === 'admin' ? '👑' : '👤'}</div>
            <div className="text-sm text-gray-600">{user.role === 'admin' ? '管理员' : '普通用户'}</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{favorites.length}</div>
            <div className="text-sm text-gray-600">收藏</div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <p className="text-gray-900">{user.email}</p>
          </div>
          {user.bio && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
              <p className="text-gray-900">{user.bio}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">注册时间</label>
            <p className="text-gray-900">{formatDate(user.created_at)}</p>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              个人资料
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              我的收藏 ({favorites.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'favorites' ? (
            <div className="space-y-4">
              {favorites.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">还没有收藏任何帖子</p>
                  <Link to="/" className="text-purple-600 hover:underline">
                    去逛逛 →
                  </Link>
                </div>
              ) : (
                favorites.map((favorite) => (
                  <Link
                    key={favorite.id}
                    to={`/post/${favorite.id}`}
                    className="block p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{favorite.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>作者: {favorite.author_name}</span>
                      <span>收藏于: {formatDate(favorite.favorited_at)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <p className="text-gray-900">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <p className="text-gray-900">{user.role === 'admin' ? '管理员' : '普通用户'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">注册时间</label>
                <p className="text-gray-900">{formatDate(user.created_at)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
