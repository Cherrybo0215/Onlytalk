import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white/90 backdrop-blur-xl shadow-xl border-b border-white/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/" className="group flex items-center gap-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <span className="text-white text-lg sm:text-xl font-bold">O</span>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                    OnlyTalk
                  </div>
                  <div className="text-xs text-gray-500 hidden sm:block">畅所欲言</div>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  <Link
                    to="/shop"
                    className="hidden sm:block px-3 sm:px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium text-sm sm:text-base"
                  >
                    🛒 商城
                  </Link>
                  <Link
                    to="/leaderboard"
                    className="hidden sm:block px-3 sm:px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium text-sm sm:text-base"
                  >
                    🏆 排行
                  </Link>
                  <Link
                    to="/create"
                    className="btn-primary text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">✨ 发帖</span>
                    <span className="sm:hidden">✨</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="px-3 sm:px-4 py-2 rounded-xl text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 font-medium text-sm sm:text-base flex items-center gap-2"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline">{user.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 sm:px-4 py-2 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300 text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">退出</span>
                    <span className="sm:hidden">🚪</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 sm:px-4 py-2 rounded-xl text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 font-medium text-sm sm:text-base"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm sm:text-base"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}

