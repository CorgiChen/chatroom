// components/MemberList.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import UserHoverCard from './UserCard';
import AddUserByIdForm from './AddUserByIdForm';

const MemberList = ({ allUsers, currentNickname, chatroomId }) => {
  const [roomMembers, setRoomMembers] = useState([]);       // ← 新增
  const [selectedUser, setSelectedUser] = useState(null);
  const location = useLocation();
  const isPublic = location.pathname === '/';

  // 當 chatroomId 有值時，訂閱該 chatroom 文件，並取出 members 陣列
  useEffect(() => {
    if (!chatroomId) {
      setRoomMembers([]);
      return;
    }
    const ref = doc(db, 'chatrooms', chatroomId);
    const unsub = onSnapshot(ref, snap => {
      setRoomMembers(snap.exists() ? snap.data().members : []);
    });
    return () => unsub();
  }, [chatroomId]);

  // 根據是否公開聊天室決定要顯示誰
  const displayedUsers = isPublic
    ? allUsers.filter(u => u.nickname && u.nickname !== currentNickname)
    : allUsers.filter(
        u =>
          u.nickname &&
          u.nickname !== currentNickname &&
          roomMembers.includes(u.uid)   // ← 只保留真正的成員
      );

  const truncateName = name =>
    name.length > 5 ? name.slice(0, 5) + '...' : name;

  const renderUser = u => (
    <div
      key={u.uid}
      className="flex items-center space-x-3 px-2 py-1 rounded hover:bg-[#3c3d40] cursor-pointer"
      onClick={() => setSelectedUser(u)}
    >
      <img src={u.avatarURL || '/corgi_chat.png'} alt = "Corgi Chat" className="w-8 h-8 rounded-full" />
      <p className="text-sm font-medium">
        {truncateName(u.nickname)} <span className="text-xs text-gray-400">{u.userId}</span>
      </p>
    </div>
  );

  return (
    <div className="w-60 h-screen bg-[#2b2d31] p-4 flex flex-col overflow-y-auto">
      {!isPublic && chatroomId && <AddUserByIdForm chatroomId={chatroomId} />}
      <h2 className="text-gray-400 uppercase mt-3">聊天室成員</h2>
      <div className="mt-2 space-y-1">
        {displayedUsers.length
          ? displayedUsers.map(renderUser)
          : <p className="text-gray-500">沒有其他人</p>}
      </div>

      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setSelectedUser(null)}
        >
          <div onClick={e => e.stopPropagation()}>
            <UserHoverCard user={selectedUser} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;
