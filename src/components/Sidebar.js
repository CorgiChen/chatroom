import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import CreateChatRoomModal from './CreateChatRoomModal';
import UserHoverCard from './UserCard';

const Sidebar = ({ userData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [myChatrooms, setMyChatrooms] = useState([]);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const q = collection(db, 'chatrooms');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((room) => room.members.includes(auth.currentUser?.uid));
      setMyChatrooms(rooms);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="w-60 h-screen bg-[#2b2d31] border-l border-gray-700 p-4 flex flex-col space-y-4 overflow-y-auto">
      {/* Logo */}
        <div className="text-lg font-bold text-blue-300 mb-4 ">Corgi Chat</div>

        {/* 公開聊天室 */}
        <Link
          to="/"
          className={`block px-4 py-2 rounded hover:bg-[#404249] transition ${
            isActive('/') ? 'bg-[#404249]' : ''
          }`}
        >
          🏠 公開聊天室
        </Link>

        {/* 建立聊天室 */}
        <button
          onClick={() => setShowModal(true)}
          className="block text-left px-4 py-2 rounded hover:bg-[#404249] transition"
        >
          ➕ 建立聊天室
        </button>

        {/* 我的聊天室清單 */}
        <div className="mt-6 flex-1 overflow-y-auto">
          <h3 className="text-xs text-gray-400 uppercase mb-2">我的聊天室</h3>
          <div className="space-y-1">
            {myChatrooms.length > 0 ? (
              myChatrooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => navigate(`/chatroom/${room.id}`)}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm truncate hover:bg-[#404249] transition ${
                    location.pathname === `/chatroom/${room.id}` ? 'bg-[#404249]' : ''
                  }`}
                >
                  {room.name}
                </button>
              ))
            ) : (
              <p className="text-xs text-gray-500">尚未加入任何聊天室</p>
            )}
          </div>
        </div>

        {/* 左下角使用者卡片 */}
        <div className="pt-4 border-t border-gray-700 relative">
          <div
            className="flex items-center space-x-3 cursor-pointer bg-[#404249] px-3 py-2 rounded-md hover:bg-[#505255] transition group"
            onMouseEnter={() => setShowCard(true)}
            onMouseLeave={() => setShowCard(false)}
          >
            <img
              src={userData?.avatarURL || '/corgi_chat.png'}
              alt="頭像"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <div className="text-sm font-semibold">{userData?.nickname || '訪客'}</div>
              <div className="text-xs text-gray-400">{userData?.userId || ''}</div>
            </div>
          </div>

          {/* Hover 彈出完整小卡 */}
          {showCard && userData && (
            <div
              className="absolute bottom-14 left-0 z-50 animate-fade-in"
              onMouseEnter={() => setShowCard(true)}
              onMouseLeave={() => setShowCard(false)}
            >
              <UserHoverCard user={userData} />
            </div>
          )}
        </div>
      </div>

      {/* 建立聊天室 Modal */}
      {showModal && (
        <CreateChatRoomModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default Sidebar;
