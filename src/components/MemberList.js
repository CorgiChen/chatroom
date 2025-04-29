// components/MemberList.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import UserHoverCard from './UserCard';
import AddUserByIdForm from './AddUserByIdForm';
import { useTheme } from '../context/ThemeContext';
import Spinner from './Spinner';

const MemberList = ({ allUsers, currentNickname, chatroomId }) => {
  const [roomMembers, setRoomMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const location = useLocation();
  const isPublic = location.pathname === '/';
  const { isDarkMode } = useTheme();

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
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition font-medium ${
        isDarkMode
          ? 'hover:bg-[#353945] text-white'
          : 'hover:bg-gray-200 text-gray-900'
      }`}
      onClick={() => setSelectedUser(u)}
    >
      <img src={u.avatarURL || '/corgi_chat.png'} alt = "Corgi Chat" className="w-9 h-9 rounded-full" />
      <p className="text-sm font-medium">
        {truncateName(u.nickname)} <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{u.userId}</span>
      </p>
    </div>
  );

  if (!allUsers || allUsers.length === 0) {
    return <div className={`flex items-center justify-center h-screen w-60 ${isDarkMode ? 'bg-[#23272f] text-white' : 'bg-[#f4f6fa] text-gray-900'}`}><Spinner size={40} /></div>;
  }

  return (
    <div className={`w-60 h-screen flex flex-col overflow-y-auto px-4 py-4 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#23272f]' : 'bg-[#f4f6fa]'
    }`}>
      {!isPublic && chatroomId && !chatroomId.startsWith('ai-') && <AddUserByIdForm chatroomId={chatroomId} />}
      <h2 className={`uppercase mt-3 mb-2 text-xs font-bold tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>聊天室成員</h2>
      <div className="mt-2 space-y-1">
        {displayedUsers.length
          ? displayedUsers.map(renderUser)
          : <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>沒有其他人</p>}
      </div>

      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
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
