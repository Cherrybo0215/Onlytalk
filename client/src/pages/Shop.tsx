import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface ShopItem {
  id: number;
  name: string;
  description: string;
  price: number;
  item_type: string;
  item_value: string;
  icon: string;
}

export default function Shop() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/shop/items');
      setItems(response.data.items);
    } catch (error) {
      console.error('获取商品列表失败:', error);
      alert('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (itemId: number) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    setPurchasing(itemId);
    try {
      const response = await axios.post('/api/shop/purchase', { item_id: itemId });
      alert(response.data.message || '购买成功！');
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.error || '购买失败');
    } finally {
      setPurchasing(null);
    }
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
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="card p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            🛒 积分商城
          </h1>
          <p className="text-gray-600">用积分兑换各种道具和徽章</p>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold text-yellow-700">当前积分: {user.points}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="card p-5 sm:p-6 hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-purple-200"
            >
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-xl font-bold text-purple-600">{item.price}</span>
                </div>
                <button
                  onClick={() => handlePurchase(item.id)}
                  disabled={!user || purchasing === item.id || (user && user.points < item.price)}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {purchasing === item.id ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      购买中...
                    </span>
                  ) : user && user.points < item.price ? (
                    '积分不足'
                  ) : (
                    '购买'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



