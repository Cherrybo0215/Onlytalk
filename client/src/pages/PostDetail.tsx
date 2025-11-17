import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import EmojiPicker from '../components/EmojiPicker';

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
  attachments?: string;
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
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(10);
  const [rewardMessage, setRewardMessage] = useState('');
  const [rewarding, setRewarding] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [deletingPost, setDeletingPost] = useState(false);
  const [deletingComment, setDeletingComment] = useState<number | null>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

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

  const handleReward = async () => {
    if (!user) {
      alert('请先登录');
      return;
    }

    if (user.points < rewardPoints) {
      alert('积分不足');
      return;
    }

    if (!post) return;

    setRewarding(true);
    try {
      await axios.post('/api/rewards', {
        related_type: 'post',
        related_id: post.id,
        points: rewardPoints,
        message: rewardMessage,
      });
      alert(`打赏成功！打赏了 ${rewardPoints} 积分`);
      setShowRewardModal(false);
      setRewardPoints(10);
      setRewardMessage('');
      fetchPost();
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.error || '打赏失败');
    } finally {
      setRewarding(false);
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

  const handleReply = async (parentId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!replyContent.trim()) {
      alert('请输入回复内容');
      return;
    }

    try {
      await axios.post('/api/comments', {
        post_id: parseInt(id!),
        content: replyContent,
        parent_id: parentId,
      });
      setReplyContent('');
      setReplyingTo(null);
      fetchComments();
      if (post) {
        fetchPost();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || '发表回复失败');
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

  const handleDeletePost = async () => {
    if (!window.confirm('确定要删除这个帖子吗？此操作不可恢复。')) {
      return;
    }

    setDeletingPost(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('帖子删除成功');
      navigate('/');
    } catch (error: any) {
      console.error('删除帖子失败:', error);
      alert(error.response?.data?.error || '删除帖子失败');
    } finally {
      setDeletingPost(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('确定要删除这条评论吗？此操作不可恢复。')) {
      return;
    }

    setDeletingComment(commentId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(comments.filter((c) => c.id !== commentId));
      alert('评论删除成功');
    } catch (error: any) {
      console.error('删除评论失败:', error);
      alert(error.response?.data?.error || '删除评论失败');
    } finally {
      setDeletingComment(null);
    }
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
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      {/* 帖子内容 */}
      <div className="card p-6 sm:p-8 lg:p-10">
        <div className="mb-4 sm:mb-6 flex items-center justify-between flex-wrap gap-3">
          <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-purple-900/50 dark:to-blue-900/50 text-blue-700 dark:text-purple-300 text-sm rounded-full font-semibold border border-blue-200/50 dark:border-purple-500/30 shadow-sm dark:shadow-purple-500/20">
            {post.category_name || '未分类'}
          </span>
          {user && (user.id === post.author_id || user.role === 'admin') && (
            <div className="flex items-center gap-2">
              <Link
                to={`/edit-post/${post.id}`}
                className="px-3 sm:px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                ✏️ 编辑
              </Link>
              <button
                onClick={handleDeletePost}
                disabled={deletingPost}
                className="px-3 sm:px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingPost ? '删除中...' : '🗑️ 删除'}
              </button>
            </div>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100 leading-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-purple-200 dark:via-pink-200 dark:to-blue-200 bg-clip-text text-transparent dark:drop-shadow-lg">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 sm:gap-6 text-xs sm:text-sm mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200/50">
          <span className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 transition-colors">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
              {post.author_name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium">{post.author_name}</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-500">
            <span>🕒</span>
            <span>{formatDate(post.created_at)}</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-500">
            <span>👁️</span>
            <span>{post.views}</span>
          </span>
          <span className={`flex items-center gap-1.5 ${post.is_liked ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
            <span>❤️</span>
            <span>{post.likes}</span>
          </span>
        </div>
        <div className="prose max-w-none mb-6 sm:mb-8">
          <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base lg:text-lg bg-gray-50/50 dark:bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-100 dark:border-gray-700">
            {post.content}
          </div>
          {post.attachments && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📎 附件</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {JSON.parse(post.attachments).map((file: any, index: number) => (
                  <div key={index} className="relative group">
                    {file.type === 'image' ? (
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                          src={file.url}
                          alt={file.originalname}
                          className="w-full aspect-square object-cover rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all"
                          onError={(e) => {
                            console.error('图片加载失败:', file.url);
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </a>
                    ) : (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all text-center"
                      >
                        <div className="text-3xl mb-2">
                          {file.mimetype.includes('pdf') ? '📄' :
                           file.mimetype.includes('word') ? '📝' :
                           file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet') ? '📊' :
                           file.mimetype.includes('video') ? '🎥' :
                           file.mimetype.includes('zip') || file.mimetype.includes('rar') ? '📦' :
                           '📎'}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{file.originalname}</p>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200/50 flex-wrap">
          <button
            onClick={handleLike}
            disabled={liking || !user}
            className={`flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 font-medium ${
              post.is_liked
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-lg sm:text-xl transition-transform hover:scale-125">{post.is_liked ? '❤️' : '🤍'}</span>
            <span>{post.likes}</span>
          </button>
          <button
            onClick={handleFavorite}
            disabled={favoriting || !user}
            className={`flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 font-medium ${
              post.is_favorited
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 shadow-lg dark:shadow-yellow-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-lg sm:text-xl transition-transform hover:scale-125">{post.is_favorited ? '⭐' : '☆'}</span>
            <span>收藏</span>
          </button>
          {user && user.id !== post.author_id && (
            <button
              onClick={() => setShowRewardModal(true)}
              className="flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 font-medium bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 shadow-lg"
            >
              <span className="text-lg sm:text-xl">💰</span>
              <span>打赏</span>
            </button>
          )}
        </div>
      </div>

      {/* 打赏弹窗 */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRewardModal(false)}>
          <div className="card p-5 sm:p-6 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">💰 打赏帖子</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">打赏积分</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[10, 20, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setRewardPoints(amount)}
                      className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-all text-sm sm:text-base ${
                        rewardPoints === amount
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg dark:shadow-purple-500/30 scale-105'
                          : 'bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent dark:border-gray-700/50'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max={user?.points || 1000}
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(parseInt(e.target.value) || 10)}
                  className="w-full px-4 py-2.5 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm"
                  placeholder="或输入自定义金额"
                />
                {user && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">您的积分: {user.points}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">留言（可选）</label>
                <input
                  type="text"
                  value={rewardMessage}
                  onChange={(e) => setRewardMessage(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300/50 dark:border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="说点什么..."
                  maxLength={100}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowRewardModal(false);
                    setRewardPoints(10);
                    setRewardMessage('');
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleReward}
                  disabled={rewarding || !user || user.points < rewardPoints}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rewarding ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      打赏中...
                    </span>
                  ) : (
                    `打赏 ${rewardPoints} 积分`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 评论区域 */}
      <div className="card p-5 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200/50">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">💬</span>
            <span>评论</span>
            <span className="text-base sm:text-lg text-purple-600">({comments.length})</span>
          </h2>
        </div>

        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">发表评论</label>
              <EmojiPicker textareaRef={commentRef} onSelect={(emoji) => {
                if (commentRef.current) {
                  const textarea = commentRef.current;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const newContent = commentContent.substring(0, start) + emoji + commentContent.substring(end);
                  setCommentContent(newContent);
                  setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
                    textarea.focus();
                  }, 0);
                }
              }} />
            </div>
            <textarea
              ref={commentRef}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="写下你的评论... 💬"
              className="w-full p-4 border border-gray-300/50 rounded-xl mb-3 sm:mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none transition-all bg-white/50 backdrop-blur-sm"
              rows={5}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {commentContent.length > 0 && `${commentContent.length} 字符`}
              </span>
              <button
                type="submit"
                disabled={submitting || !commentContent.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    提交中...
                  </span>
                ) : (
                  '💬 发表评论'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 sm:mb-8 p-5 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl text-center border border-purple-200/50 dark:border-purple-500/30">
            <div className="text-4xl mb-2">🔒</div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold hover:underline">
                请先登录
              </Link>
              <span className="text-gray-600 dark:text-gray-400"> 后再发表评论</span>
            </p>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-5xl mb-3">💭</div>
              <p className="text-gray-500 text-lg">暂无评论，快来抢沙发吧~</p>
            </div>
          ) : (
            comments.map((comment, index) => (
              <div
                key={comment.id}
                className="p-4 sm:p-5 rounded-xl hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-300 animate-slide-up border border-gray-100/50 dark:border-gray-700/50 hover:border-purple-200/50 dark:hover:border-purple-500/30 group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                    {comment.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">{comment.author_name}</span>
                        {comment.parent_author_name && (
                          <span className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-lg border border-purple-200/50 dark:border-purple-500/30">
                            回复 @{comment.parent_author_name}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      {user && (user.id === comment.author_id || user.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingComment === comment.id}
                          className="px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-all transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingComment === comment.id ? '删除中...' : '🗑️'}
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-2 sm:mb-3 leading-relaxed text-sm sm:text-base">{comment.content}</p>
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        disabled={!user}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm transition-all transform hover:scale-105 font-medium ${
                          comment.is_liked 
                            ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200' 
                            : 'text-gray-500 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                        } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="text-base">{comment.is_liked ? '❤️' : '🤍'}</span>
                        <span>{comment.likes}</span>
                      </button>
                      {user && (
                        <button
                          onClick={() => {
                            setReplyingTo(replyingTo === comment.id ? null : comment.id);
                            setReplyContent('');
                          }}
                          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm transition-all transform hover:scale-105 font-medium text-gray-500 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                        >
                          <span>💬</span>
                          <span>回复</span>
                        </button>
                      )}
                    </div>
                    {replyingTo === comment.id && user && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl border border-purple-200/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm text-purple-700 font-medium">
                            回复 @{comment.author_name}
                          </span>
                          <EmojiPicker textareaRef={replyRef} onSelect={(emoji) => {
                            if (replyRef.current) {
                              const textarea = replyRef.current;
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const newContent = replyContent.substring(0, start) + emoji + replyContent.substring(end);
                              setReplyContent(newContent);
                              setTimeout(() => {
                                textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
                                textarea.focus();
                              }, 0);
                            }
                          }} />
                        </div>
                        <textarea
                          ref={replyRef}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="写下你的回复..."
                          className="w-full p-3 border border-gray-300/50 dark:border-purple-500/30 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 resize-none transition-all bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                          rows={3}
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                            className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyContent.trim()}
                            className="px-3 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            发送
                          </button>
                        </div>
                      </div>
                    )}
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
