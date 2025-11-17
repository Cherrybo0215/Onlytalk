import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少6个字符');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err: any) {
      console.error('注册错误详情:', err);
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].msg);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || '注册失败，请检查网络连接');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="card p-6 sm:p-8 lg:p-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-xl">
            <span className="text-3xl">🎉</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-300 dark:via-pink-300 dark:to-blue-300 bg-clip-text text-transparent dark:drop-shadow-lg">
            加入 OnlyTalk
          </h1>
          <p className="text-gray-600 dark:text-gray-300">创建账号，开始畅所欲言</p>
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
              👤 用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border border-gray-300/50 dark:border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="3-20个字符，支持中文"
              required
              minLength={3}
              maxLength={20}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">3-20个字符</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📧 邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border border-gray-300/50 dark:border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="your@email.com"
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
              placeholder="至少6个字符，建议8位以上"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">至少6个字符</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔒 确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                confirmPassword && password === confirmPassword
                  ? 'border-green-500 dark:border-green-400 focus:ring-green-500 dark:focus:ring-green-400'
                  : 'border-gray-300/50 dark:border-purple-500/30 focus:ring-purple-500/50 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400'
              }`}
              placeholder="再次输入密码"
              required
            />
            {confirmPassword && password === confirmPassword && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ 密码匹配</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                注册中...
              </span>
            ) : (
              '注册'
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          已有账号？{' '}
          <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold hover:underline">
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
}

