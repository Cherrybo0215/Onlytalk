import { useState, useRef } from 'react';
import axios from 'axios';

interface FileUploadProps {
  onUploadComplete: (files: UploadedFile[]) => void;
  maxFiles?: number;
  accept?: string;
  multiple?: boolean;
}

export interface UploadedFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  type: string;
}

export default function FileUpload({ onUploadComplete, maxFiles = 5, accept, multiple = true }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files).slice(0, maxFiles);

    setUploading(true);
    const formData = new FormData();
    filesArray.forEach(file => {
      formData.append('files', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const newFiles = response.data.files;
      console.log('上传成功，文件信息:', newFiles);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      onUploadComplete([...uploadedFiles, ...newFiles]);
      
      // 清除预览URL（使用服务器返回的URL）
      setPreviewUrls([]);
    } catch (error: any) {
      console.error('文件上传失败:', error);
      alert(error.response?.data?.error || '文件上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onUploadComplete(newFiles);
    
    // 释放预览URL
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newPreviews);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept || 'image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar'}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all ${
            uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
          }`}
        >
          {uploading ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span>上传中...</span>
            </>
          ) : (
            <>
              <span>📎</span>
              <span>上传文件</span>
            </>
          )}
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          支持图片、视频、文档等，最多 {maxFiles} 个文件，单个文件最大 10MB
        </p>
      </div>

      {/* 预览区域 */}
      {(uploadedFiles.length > 0 || previewUrls.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative group">
              {file.type === 'image' ? (
                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700/50">
                  <img
                    src={file.url}
                    alt={file.originalname}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('图片加载失败:', file.url);
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/80 flex flex-col items-center justify-center p-2">
                  <div className="text-3xl mb-1">
                    {file.mimetype.includes('pdf') ? '📄' :
                     file.mimetype.includes('word') ? '📝' :
                     file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet') ? '📊' :
                     file.mimetype.includes('video') ? '🎥' :
                     file.mimetype.includes('zip') || file.mimetype.includes('rar') ? '📦' :
                     '📎'}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 text-center truncate w-full px-1">
                    {file.originalname}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatFileSize(file.size)}
                  </p>
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

