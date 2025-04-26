import React, { useEffect, useRef } from 'react';

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  return (
    <div className="flex flex-col">
      {/* 訊息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 break-words">
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
                  <span>
                    {user.nickname || '使用者'}{' '}
                    <span className="text-xs text-gray-400">{user.userId || ''}</span>
                  </span>
                  {isSelf && (
                    <button
                      onClick={() => onUnsend(msg.id)}
                      className="hidden group-hover:inline-block text-xs text-red-400 hover:text-red-500"
                    >
                      🗑 收回
                    </button>
                  )}
                </div>
                <div className="text-white text-sm whitespace-pre-wrap">{msg.text}</div>
                <div className="text-xs text-gray-500 mt-1">{formatTime(msg.createdAt)}</div>
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
