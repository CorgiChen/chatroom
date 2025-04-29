import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const MessageList = ({
  messages,
  userMap,
  currentUid,
  onUnsend,
  searchTerm = '',
  onSearchChange = () => {},
  chatroomName = '',
}) => {
  const messagesEndRef = useRef(null);
  const [prevCount, setPrevCount] = useState(messages.length);
  const [selectedGif, setSelectedGif] = useState(null);
  const { isDarkMode } = useTheme();

  const filteredMessages = messages.filter((msg) =>
    msg.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (time) => {
    try {
      if (!time) return '';
      const date = typeof time.toDate === 'function' ? time.toDate() : new Date(time);
      if (isNaN(date.getTime())) return '';
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month}/${day} ${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  const lastMessageIdRef = useRef(filteredMessages.length > 0 ? filteredMessages[filteredMessages.length - 1]?.id : null);

  useEffect(() => {
    if (filteredMessages.length > prevCount) {
      const newLast = filteredMessages[filteredMessages.length - 1];
      if (newLast && newLast.uid === currentUid) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setPrevCount(filteredMessages.length);
    lastMessageIdRef.current = filteredMessages.length > 0 ? filteredMessages[filteredMessages.length - 1]?.id : null;
  }, [filteredMessages, prevCount, currentUid]);

  const isGifUrl = (text) => {
    return text.startsWith('{gif:') && text.endsWith('}');
  };

  const getGifUrl = (text) => {
    return text.slice(5, -1);
  };

  const isImageData = (text) => {
    return text.startsWith('{image:') && text.endsWith('}');
  };

  const getImageData = (text) => {
    return text.slice(7, -1);
  };

  return (
    <div className="flex flex-col">
      {/* 訊息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 break-words custom-scroll">
        {filteredMessages.map((msg) => {
          const user = userMap[msg.uid] || {};
          const isSelf = msg.uid === currentUid;
          const isBot = msg.uid === 'bot';
          const isGif = isGifUrl(msg.text);
          const isImage = isImageData(msg.text);

          // 動態決定自己的訊息底色
          let selfBubbleClass = '';
          if (isSelf) {
            selfBubbleClass = isDarkMode
              ? 'bg-[#0891b2] text-white' // 深色模式：更深的藍綠色
              : 'bg-[#5865F2] text-white';   // 淺色模式：維持藍色
          }

          return (
            <div key={msg.id} className={`flex items-start space-x-3 group ${isSelf ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <img
                src={user.avatarURL || '/corgi_chat.png'}
                alt="頭像"
                className={`w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 ${
                  isDarkMode 
                    ? 'ring-[#5865F2] ring-offset-[#2b2d31]' 
                    : 'ring-blue-500 ring-offset-white'
                }`}
              />
              <div className={`flex-1 max-w-[80%] ${isSelf ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center space-x-2 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-sm font-bold ${
                    isDarkMode ? 'text-[#5865F2]' : 'text-blue-600'
                  }`}>
                    {isBot ? 'CORGI AI' : (user.nickname || '使用者')}
                  </span>
                  <span className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {isBot ? '#AI' : (user.userId || '')}
                  </span>
                  {isSelf && (
                    <button
                      onClick={() => onUnsend(msg.id)}
                      className="hidden group-hover:inline-block text-xs text-red-400 hover:text-red-500 transition-colors"
                    >
                      🗑 收回
                    </button>
                  )}
                </div>
                <div className={`mt-1 p-3 rounded-2xl shadow-lg transition-colors duration-300 ${
                  isBot 
                    ? isDarkMode 
                      ? 'bg-[#5865F2]/10 text-white' 
                      : 'bg-blue-100 text-gray-800'
                    : isSelf 
                      ? selfBubbleClass
                      : isDarkMode
                        ? 'bg-[#2b2d31] text-white'
                        : 'bg-gray-100 text-gray-800'
                }`}>
                  {isImage ? (
                    <img
                      src={getImageData(msg.text)}
                      alt="圖片"
                      className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedGif(getImageData(msg.text))}
                    />
                  ) : isGif ? (
                    <img
                      src={getGifUrl(msg.text)}
                      alt="GIF"
                      className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedGif(getGifUrl(msg.text))}
                    />
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                  )}
                </div>
                <div className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-600'
                }`}>{formatTime(msg.createdAt)}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* GIF 預覽彈窗 */}
      {selectedGif && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedGif(null)}
        >
          <img
            src={selectedGif}
            alt="GIF Preview"
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default MessageList;
