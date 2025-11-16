import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface LeaderboardUser {
  id: number;
  username: string;
  points: number;
  level: number;
  avatar: string | null;
  post_count: number;
  comment_count: number;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'points' | 'level'>('points');

  useEffect(() => {
    fetchLeaderboard();
  }, [type]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const endpoint = type === 'points' ? '/api/leaderboard/points' : '/api/leaderboard/level';
      const response = await axios.get(endpoint);
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('获取排行榜失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    if (level < 5) return 'from-gray-400 to-gray-600';
    if (level < 10) return 'from-green-400 to-green-600';
    if (level < 20) return 'from-blue-400 to-blue-600';
    if (level < 30) return 'from-purple-400 to-purple-600';
    return 'from-yellow-400 to-yellow-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
        <p className="mt-4 text-gray-500 text-lg">加载中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            🏆 排行榜
          </h1>
          <p className="text-gray-600">看看谁是最活跃的用户</p>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setType('points')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              type === 'points'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⭐ 积分榜
          </button>
          <button
            onClick={() => setType('level')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              type === 'level'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📈 等级榜
          </button>
        </div>

        <div className="space-y-3">
          {leaderboard.map((userItem, index) => {
            const rank = index + 1;
            const isCurrentUser = user && user.id === userItem.id;
            return (
              <Link
                key={userItem.id}
                to="/profile"
                className={`block p-4 sm:p-5 rounded-xl transition-all duration-300 border-2 ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 shadow-lg'
                    : 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 sm:w-12 text-center">
                    <span className="text-xl sm:text-2xl font-bold text-purple-600">
                      {rank <= 3 ? getRankIcon(rank) : rank}
                    </span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
                    {userItem.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{userItem.username}</span>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">我</span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-white text-xs font-medium bg-gradient-to-r ${getLevelColor(
                          userItem.level
                        )}`}
                      >
                        Lv.{userItem.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span>⭐</span>
                        <span>{userItem.points} 积分</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📝</span>
                        <span>{userItem.post_count} 帖子</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>💬</span>
                        <span>{userItem.comment_count} 评论</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

