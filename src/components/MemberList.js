import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import UserHoverCard from './UserCard';
import { useLocation } from 'react-router-dom';

const MemberList = ({ allUsers, currentNickname, chatroomId }) => {
  const [members, setMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const location = useLocation();
  const isPublic = location.pathname === '/'; // ✅ 判斷是否公開聊天室

  useEffect(() => {
    if (!chatroomId) return; // 如果是公開聊天室就不用監聽

    const unsub = onSnapshot(doc(db, 'chatrooms', chatroomId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setMembers(data.members || []);
      }
    });

    return () => unsub();
  }, [chatroomId]);

  // ✅ 成員篩選邏輯：公開聊天室 vs 私人聊天室
  const displayedUsers = isPublic
    ? allUsers.filter((u) => u.nickname && u.nickname !== currentNickname)
    : allUsers.filter(
        (u) => u.nickname && u.nickname !== currentNickname && members.includes(u.uid)
      );

  const renderUser = (user) => (
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
          {user.nickname}
          <span className="text-xs text-gray-400"> {user.userId}</span>
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="w-60 h-screen bg-[#2b2d31] border-l border-gray-700 p-4 space-y-4 text-sm overflow-y-auto hidden md:block md:static fixed right-0 top-0">
        <h2 className="text-gray-400 uppercase">
          {isPublic ? '公開聊天室成員' : '聊天室成員'}（{displayedUsers.length}人）
        </h2>

        <div className="space-y-1 mt-2">
          {displayedUsers.length > 0
            ? displayedUsers.map((u) => renderUser(u))
            : <p className="text-gray-500">沒有其他人</p>}
        </div>
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
