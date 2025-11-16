import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface CheckInStatus {
  checked_in_today: boolean;
  consecutive_days: number;
  today_checkin: any;
}

export default function CheckInButton() {
  const { user } = useAuth();
  const [status, setStatus] = useState<CheckInStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchStatus = async () => {
    try {
      const response = await axios.get('/api/checkin/status');
      setStatus(response.data);
    } catch (error) {
      console.error('获取签到状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user) {
      alert('请先登录');
      return;
    }

    setCheckingIn(true);
    try {
      const response = await axios.post('/api/checkin');
      alert(
        `签到成功！获得 ${response.data.checkin.points_earned} 积分，已连续签到 ${response.data.checkin.consecutive_days} 天`
      );
      await fetchStatus();
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.error || '签到失败');
    } finally {
      setCheckingIn(false);
    }
  };

  if (!user || loading) {
    return null;
  }

  if (status?.checked_in_today) {
    return (
      <div className="card p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-green-800">✅ 今日已签到</p>
            <p className="text-sm text-green-600">连续签到 {status.consecutive_days} 天</p>
          </div>
          <div className="text-3xl">🎉</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="font-semibold text-purple-800">每日签到</p>
          <p className="text-sm text-purple-600">
            {status?.consecutive_days ? `连续签到 ${status.consecutive_days} 天` : '开始签到之旅'}
          </p>
        </div>
        <button
          onClick={handleCheckIn}
          disabled={checkingIn}
          className="btn-primary text-sm sm:text-base"
        >
          {checkingIn ? (
            <span className="flex items-center gap-2">
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              签到中...
            </span>
          ) : (
            '📅 签到'
          )}
        </button>
      </div>
    </div>
  );
}

