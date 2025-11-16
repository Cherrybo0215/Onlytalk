import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Post {
  id: number;
  title: string;
  content: string;
  author_name: string;
  category_name: string;
  views: number;
  likes: number;
  created_at: string;
  author_id: number;
  is_liked?: number;
  is_favorited?: number;
}

interface Comment {
  id: number;
  content: string;
  author_name: string;
  parent_id: number | null;
  parent_author_name: string | null;
  created_at: string;
  author_id: number;
  likes: number;
  is_liked?: number;
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('获取帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/post/${id}`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLiking(true);
    try {
      const response = await axios.post(`/api/likes/posts/${id}`);
      if (post) {
        setPost({
          ...post,
          likes: response.data.liked ? post.likes + 1 : post.likes - 1,
          is_liked: response.data.liked ? 1 : 0,
        });
      }
    } catch (error: any) {
      alert(error.response?.data?.error || '操作失败');
    } finally {
      setLiking(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setFavoriting(true);
    try {
      const response = await axios.post(`/api/favorites/posts/${id}`);
      if (post) {
        setPost({
          ...post,
          is_favorited: response.data.favorited ? 1 : 0,
        });
      }
    } catch (error: any) {
      alert(error.response?.data?.error || '操作失败');
    } finally {
      setFavoriting(false);
    }
  };

  const handleCommentLike = async (commentId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`/api/likes/comments/${commentId}`);
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes: response.data.liked ? comment.likes + 1 : comment.likes - 1,
                is_liked: response.data.liked ? 1 : 0,
              }
            : comment
        )
      );
    } catch (error: any) {
      alert(error.response?.data?.error || '操作失败');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!commentContent.trim()) {
      alert('请输入评论内容');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/comments', {
        post_id: parseInt(id!),
        content: commentContent,
      });
      setCommentContent('');
      fetchComments();
      if (post) {
        fetchPost();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || '发表评论失败');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-2 text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500">帖子不存在</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* 帖子内容 */}
      <div className="card p-8">
        <div className="mb-4">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm rounded-full font-medium">
            {post.category_name || '未分类'}
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-6 text-gray-900">{post.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
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
            ❤️ {post.likes}
          </span>
        </div>
        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{post.content}</p>
        </div>
        <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleLike}
            disabled={liking || !user}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              post.is_liked
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-lg">{post.is_liked ? '❤️' : '🤍'}</span>
            <span>{post.likes}</span>
          </button>
          <button
            onClick={handleFavorite}
            disabled={favoriting || !user}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              post.is_favorited
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-lg">{post.is_favorited ? '⭐' : '☆'}</span>
            <span>收藏</span>
          </button>
        </div>
      </div>

      {/* 评论区域 */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          💬 评论 ({comments.length})
        </h2>

        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="写下你的评论..."
              className="w-full p-4 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={4}
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '提交中...' : '发表评论'}
            </button>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg text-center border border-purple-200">
            <Link to="/login" className="text-purple-600 hover:underline font-medium">
              请先登录
            </Link>
            <span className="text-gray-600"> 后再发表评论</span>
          </div>
        )}

        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">暂无评论，快来抢沙发吧~</div>
          ) : (
            comments.map((comment, index) => (
              <div
                key={comment.id}
                className="p-4 rounded-lg hover:bg-gray-50 transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-800">{comment.author_name}</span>
                      {comment.parent_author_name && (
                        <span className="text-sm text-purple-600">
                          回复 @{comment.parent_author_name}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap mb-2">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        disabled={!user}
                        className={`flex items-center gap-1 text-sm ${
                          comment.is_liked ? 'text-red-500' : 'text-gray-500'
                        } hover:text-red-500 transition-colors ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span>{comment.is_liked ? '❤️' : '🤍'}</span>
                        <span>{comment.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
