import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const TENOR_API_KEY = 'AIzaSyD-3SR-DU0q8fGSk3oYjG65Do1ysVR0BYY'; // Replace with your Tenor API key

// 取得 GIF 圖片網址
const getGifUrl = (gif) => (
  gif.media_formats?.gif?.url ||
  gif.media_formats?.mediumgif?.url ||
  gif.media_formats?.tinygif?.url ||
  ''
);

// 取得預覽圖網址
const getPreviewUrl = (gif) => (
  gif.media_formats?.gif?.preview?.url ||
  gif.media_formats?.mediumgif?.preview?.url ||
  gif.media_formats?.tinygif?.preview?.url ||
  getGifUrl(gif)
);

const GifPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const searchGifs = async () => {
      if (!searchTerm) {
        setGifs([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(searchTerm)}&key=${TENOR_API_KEY}&client_key=my_test_app&limit=20`
        );
        const data = await response.json();
        // console.log(data.results); // debug 用
        setGifs(data.results || []);
      } catch (error) {
        console.error('Error fetching GIFs:', error);
      }
      setLoading(false);
    };

    const debounceTimer = setTimeout(searchGifs, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      isDarkMode ? 'bg-black/80' : 'bg-gray-800/80'
    }`}>
      <div className={`w-full max-w-2xl p-4 rounded-lg shadow-xl ${
        isDarkMode ? 'bg-[#2b2d31]' : 'bg-white'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>搜尋 GIF</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-200 ${
              isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-800'
            }`}
          >
            ✕
          </button>
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="輸入關鍵字搜尋 GIF..."
          className={`w-full p-2 rounded-lg mb-4 ${
            isDarkMode 
              ? 'bg-[#1f2023] text-white border-gray-700' 
              : 'bg-gray-100 text-gray-800 border-gray-200'
          } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto custom-scroll">
          {loading ? (
            <div className="col-span-full text-center py-4">載入中...</div>
          ) : gifs.length > 0 ? (
            gifs.map((gif) => (
              <div
                key={gif.id}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onSelect(getGifUrl(gif))}
              >
                <img
                  src={getPreviewUrl(gif)}
                  alt={gif.content_description}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            ))
          ) : searchTerm ? (
            <div className="col-span-full text-center py-4">
              找不到相關的 GIF
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default GifPicker; 