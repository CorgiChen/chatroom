import React from 'react';

const UserHoverCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="bg-[#2b2d31] text-white p-6 rounded-2xl shadow-xl w-72 space-y-3 border-2 border-blue-400">
      <div className="flex flex-col items-center">
        <img
          src={user.avatarURL || '/corgi_chat.png'}
          alt="頭像"
          className="w-20 h-20 rounded-full object-cover mb-2"
        />
        <div className="text-lg font-bold">{user.nickname || '使用者'}</div>
        <div className="text-sm text-gray-400">{user.userId || ''}</div>
      </div>

      <div className="text-sm text-gray-300 mt-2 whitespace-pre-line text-center">
        {user.introduction?.trim()
          ? user.introduction
          : '這個人什麼也沒留下。'}
      </div>
    </div>
  );
};

export default UserHoverCard;
