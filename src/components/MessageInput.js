import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import GifPicker from './GifPicker';

const MAX_IMAGE_SIZE_KB = 500;
const MAX_IMAGE_WIDTH = 800;

function fileToBase64AndCompress(file, maxSizeKB = MAX_IMAGE_SIZE_KB, maxWidth = MAX_IMAGE_WIDTH) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new window.Image();
      img.onload = function () {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((maxWidth / width) * height);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.92;
        let base64 = canvas.toDataURL('image/jpeg', quality);
        while (base64.length / 1024 > maxSizeKB && quality > 0.5) {
          quality -= 0.05;
          base64 = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFile) {
      // 傳送圖片
      try {
        const base64 = await fileToBase64AndCompress(imageFile);
        onSend(`{image:${base64}}`);
        setImagePreview('');
        setImageFile(null);
      } catch {
        alert('圖片處理失敗，請換一張圖片');
      }
      return;
    }
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleGifSelect = (gifUrl) => {
    onSend(`{gif:${gifUrl}}`);
    setShowGifPicker(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片檔案');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleCancelImage = () => {
    setImagePreview('');
    setImageFile(null);
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setShowGifPicker(true)}
          className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${
            isDarkMode 
              ? 'text-white hover:bg-gray-700' 
              : 'text-gray-800'
          }`}
          title="搜尋 GIF"
        >
          🎬
        </button>
        <label className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
          <span role="img" aria-label="圖片">🖼️</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="輸入訊息..."
          className={`flex-1 p-2 rounded-lg ${
            isDarkMode 
              ? 'bg-[#1f2023] text-white border-gray-700' 
              : 'bg-gray-100 text-gray-800 border-gray-200'
          } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
          disabled={!!imageFile}
        />
        <button
          type="submit"
          className={`p-2 rounded-full ${
            isDarkMode 
              ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } transition-colors`}
        >
          ➤
        </button>
      </form>

      {/* 預覽圖片 */}
      {imagePreview && (
        <div className="mt-2 flex items-center space-x-2">
          <img src={imagePreview} alt="預覽" className="w-24 h-24 object-cover rounded-lg border" />
          <button
            type="button"
            onClick={handleCancelImage}
            className="px-2 py-1 rounded bg-red-500 text-white text-xs"
          >
            取消
          </button>
        </div>
      )}

      {showGifPicker && (
        <GifPicker
          onSelect={handleGifSelect}
          onClose={() => setShowGifPicker(false)}
        />
      )}
    </div>
  );
};

export default MessageInput; 