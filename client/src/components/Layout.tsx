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
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                OnlyTalk
              </Link>
              <span className="ml-2 text-sm text-gray-500">畅所欲言</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/create"
                    className="btn-primary"
                  >
                    ✨ 发帖
                  </Link>
                  <Link
                    to="/profile"
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium"
                  >
                    👤 {user.username}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    退出
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

