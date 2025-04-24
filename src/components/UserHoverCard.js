
import React from 'react';

const UserHoverCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="w-80 bg-[#2b2d31] text-white rounded-xl shadow-xl p-6">
      {/* 頭像區 */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={user.avatarURL || '/corgi_chat.png'}
            alt="頭像"
            className="w-16 h-16 rounded-full border-2 border-white object-cover"
          />
          <span
            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#2b2d31] ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}
          />
        </div>
        <div>
          <p className="text-lg font-bold leading-tight">{user.nickname}</p>
          <p className="text-sm text-gray-400">{user.userId}</p>
        </div>
      </div>

      {/* 分隔線 */}
      <hr className="my-4 border-gray-600" />

      {/* Email */}
      {user.email && (
        <div className="text-sm text-gray-400 mb-2 break-all">
          📧 {user.email}
        </div>
      )}

      {/* Bio */}
      {user.bio && (
        <div className="text-sm text-gray-300 whitespace-pre-line break-words mb-4">
          {user.bio}
        </div>
      )}

      {/* 私訊按鈕 */}
      <button
        onClick={() => alert(`已發送私訊給 ${user.nickname}`)}
        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold text-sm"
      >
        發起私訊
      </button>
    </div>
  );
};

export default UserHoverCard;
