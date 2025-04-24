
import React, { useState } from 'react';
import UserHoverCard from './UserHoverCard';

const MemberList = ({ allUsers, currentNickname }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const isValid = user => user.nickname && user.nickname !== currentNickname;

  const onlineFriends = allUsers.filter(u => isValid(u) && u.status === 'online');
  const offlineFriends = allUsers.filter(u => isValid(u) && u.status === 'offline');
  const suggested = allUsers.filter(u => isValid(u) && !['online', 'offline'].includes(u.status));

  const truncateName = (name) => {
    return name.length > 5 ? name.slice(0, 5) + '...' : name;
  };

  const renderUser = (user, statusColor = 'bg-gray-500', faded = false) => (
    <div
      key={user.userId}
      className={`flex items-center space-x-3 px-2 py-1 rounded hover:bg-[#3c3d40] transition cursor-pointer ${faded ? 'opacity-50' : ''}`}
      onClick={() => setSelectedUser(user)}
    >
      <img
        src={user.avatarURL || '/corgi_chat.png'}
        alt="頭像"
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="flex-1 leading-tight">
        <p className="text-sm font-medium truncate">
          {truncateName(user.nickname)} <span className="text-xs text-gray-400">{user.userId}</span>
        </p>
      </div>
      <div className={`w-2 h-2 ${statusColor} rounded-full`} />
    </div>
  );

  return (
    <>
      <aside className="w-60 bg-[#2b2d31] border-l border-gray-700 p-4 space-y-4 text-sm">
        <h2 className="text-gray-400 uppercase">線上好友</h2>
        {onlineFriends.length ? onlineFriends.map(u => renderUser(u, 'bg-green-400')) : <p className="text-gray-500">沒有線上好友</p>}

        <h2 className="text-gray-400 uppercase mt-6">離線好友</h2>
        {offlineFriends.length ? offlineFriends.map(u => renderUser(u, 'bg-gray-500', true)) : <p className="text-gray-500">沒有離線好友</p>}

        <h2 className="text-gray-400 uppercase mt-6">你或許想認識的人</h2>
        {suggested.length ? suggested.map(u => renderUser(u, 'bg-blue-400')) : <p className="text-gray-500">沒有推薦對象</p>}
      </aside>

      {/* 中央彈出小卡 */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedUser(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <UserHoverCard user={selectedUser} />
          </div>
        </div>
      )}
    </>
  );
};

export default MemberList;
