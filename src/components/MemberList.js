import React, { useState } from 'react';
import UserHoverCard from './UserCard';

const MemberList = ({ allUsers, currentNickname }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const isValid = (user) => user.nickname && user.nickname !== currentNickname;

  const displayedUsers = allUsers.filter(isValid);

  const truncateName = (name) => {
    return name.length > 5 ? name.slice(0, 5) + '...' : name;
  };

  const renderUser = (user) => {
    return (
      <div
        key={user.userId}
        className="flex items-center space-x-3 px-2 py-1 rounded hover:bg-[#3c3d40] transition cursor-pointer"
        onClick={() => setSelectedUser(user)}
      >
        <img
          src={user.avatarURL || '/corgi_chat.png'}
          alt="頭像"
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1 leading-tight">
          <p className="text-sm font-medium truncate">
            {truncateName(user.nickname)}{' '}
            <span className="text-xs text-gray-400">{user.userId}</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <aside className="w-60 h-screen bg-[#2b2d31] border-l border-gray-700 p-4 space-y-4 text-sm overflow-y-auto z-50 shadow-xl hidden md:block md:static fixed right-0 top-0">
        <h2 className="text-gray-400 uppercase">所有使用者</h2>
        {displayedUsers.length
          ? displayedUsers.map((u) => renderUser(u))
          : <p className="text-gray-500">目前沒有其他使用者</p>}
      </aside>

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedUser(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <UserHoverCard user={selectedUser} />
          </div>
        </div>
      )}
    </>
  );
};

export default MemberList;
