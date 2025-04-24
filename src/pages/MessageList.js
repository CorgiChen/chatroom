
import React, { useEffect, useRef, useState } from 'react';

const MessageList = ({ messages, userMap, currentUid, onUnsend }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const filteredMessages = messages.filter(msg =>
    msg.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (time) => {
    const date = new Date(time);
    const month = date.getMonth() + 1; // Months are 0-based
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${month < 10 ? `0${month}` : month}/${day < 10 ? `0${day}` : day} ${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  return (
    <div className="flex flex-col h-full">
      {/* 搜尋列 */}
      <div className="p-3 border-b border-gray-700 bg-[#2b2d31]">
        <input
          type="text"
          placeholder="搜尋訊息..."
          className="w-full px-3 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring focus:ring-blue-500 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 訊息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.map((msg) => {
          const user = userMap[msg.uid] || {};
          const isSelf = msg.uid === currentUid;

          return (
            <div key={msg.id} className="flex items-start space-x-3 group">
              <img
                src={user.avatarURL || '/corgi_chat.png'}
                alt="頭像"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="text-sm font-bold text-blue-400 flex justify-between items-center">
                  <span>{user.nickname || '使用者'} <span className="text-gray-500 text-xs">{user.userId || ''}</span></span>
                  {isSelf && (
                    <button
                      onClick={() => onUnsend(msg.id)}
                      className="hidden group-hover:inline-block text-xs text-red-400 hover:text-red-500"
                    >
                      🗑 收回
                    </button>
                  )}
                </div>
                <div className="text-white text-sm">{msg.text}</div>
                <div className="text-xs text-gray-500 mt-1">{formatTime(msg.time)}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
