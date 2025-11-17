import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import EmojiPicker from '../components/EmojiPicker';
import FileUpload, { UploadedFile } from '../components/FileUpload';

interface Category {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  category_id: number | null;
  attachments?: string;
  author_id: number;
}

export default function EditPost() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCategories();
    fetchPost();
  }, [user, navigate, id]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const postData = response.data;
      setPost(postData);
      setTitle(postData.title);
      setContent(postData.content);
      setCategoryId(postData.category_id);
      
      // 检查权限
      if (user && user.id !== postData.author_id && user.role !== 'admin') {
        alert('无权编辑此帖子');
        navigate(`/post/${id}`);
        return;
      }

      // 加载附件
      if (postData.attachments) {
        try {
          const parsedAttachments = JSON.parse(postData.attachments);
          setAttachments(parsedAttachments);
        } catch (e) {
          console.error('解析附件失败:', e);
        }
      }
    } catch (error: any) {
      console.error('获取帖子失败:', error);
      alert(error.response?.data?.error || '获取帖子失败');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('请输入标题');
      return;
    }

    if (!content.trim()) {
      alert('请输入内容');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/posts/${id}`,
        {
          title,
          content,
          category_id: categoryId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('帖子更新成功');
      navigate(`/post/${id}`);
    } catch (error: any) {
      console.error('更新帖子失败:', error);
      alert(error.response?.data?.error || '更新帖子失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="card p-6 sm:p-8 lg:p-10">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="card p-6 sm:p-8 lg:p-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-300 dark:via-pink-300 dark:to-blue-300 bg-clip-text text-transparent dark:drop-shadow-lg">
            ✏️ 编辑帖子
          </h1>
          <p className="text-gray-600 dark:text-gray-300">修改你的帖子内容</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📂 分类
            </label>
            <select
              value={categoryId || ''}
              onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-3 border border-gray-300/50 dark:border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100"
            >
              <option value="">选择分类（可选）</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标题 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300/50 dark:border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="输入一个吸引人的标题..."
              maxLength={200}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title.length}/200</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                内容 *
              </label>
              <EmojiPicker textareaRef={contentRef} onSelect={(emoji) => {
                if (contentRef.current) {
                  const textarea = contentRef.current;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const newContent = content.substring(0, start) + emoji + content.substring(end);
                  setContent(newContent);
                  setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
                    textarea.focus();
                  }, 0);
                }
              }} />
            </div>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300/50 dark:border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              rows={12}
              placeholder="分享你的想法... 💭"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{content.length} 字符</p>
          </div>

          <div className="flex gap-3 sm:gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  更新中...
                </span>
              ) : (
                '💾 保存修改'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/post/${id}`)}
              className="btn-secondary"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

