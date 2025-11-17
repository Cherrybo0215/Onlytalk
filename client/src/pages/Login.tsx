import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="card p-6 sm:p-8 lg:p-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-xl">
            <span className="text-3xl">👋</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-300 dark:via-pink-300 dark:to-blue-300 bg-clip-text text-transparent dark:drop-shadow-lg">
            欢迎回来
          </h1>
          <p className="text-gray-600 dark:text-gray-300">登录到 OnlyTalk</p>
        </div>
        {error && (
          <div className="mb-4 sm:mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2 animate-slide-up">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              👤 用户名或邮箱
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border border-gray-300/50 dark:border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="输入用户名或邮箱"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔒 密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border border-gray-300/50 dark:border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="输入密码"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                登录中...
              </span>
            ) : (
              '登录'
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          还没有账号？{' '}
          <Link to="/register" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold hover:underline">
            立即注册
          </Link>
        </div>
      </div>
    </div>
  );
}

