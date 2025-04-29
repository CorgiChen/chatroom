import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import CreateChatRoomModal from './CreateChatRoomModal';
import { signOut } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext';
import Spinner from './Spinner';

const Sidebar = ({ userData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [myChatrooms, setMyChatrooms] = useState([]);
  const { isDarkMode } = useTheme();

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

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/signin');
  };

  if (!userData) {
    return <div className={`flex items-center justify-center h-screen w-60 ${isDarkMode ? 'bg-[#23272f] text-white' : 'bg-[#f4f6fa] text-gray-900'}`}><Spinner size={40} /></div>;
  }

  return (
    <>
      <div className={`w-60 h-screen flex flex-col space-y-4 overflow-y-auto border-r transition-colors duration-300 px-6 py-4 ${
        isDarkMode
          ? 'bg-[#23272f] border-[#23272f] text-white'
          : 'bg-[#f4f6fa] border-gray-200 text-gray-900'
      }`}>
        {/* 上方固定區塊：登出按鈕 + 使用者卡片 */}
        <div className={`sticky top-0 z-10 pb-2 ${isDarkMode ? 'bg-[#23272f]' : 'bg-[#f4f6fa]'}`}>
          <div className="flex justify-end mb-2">
            <button
              onClick={handleLogout}
              className={`rounded-md px-3 py-1 transition flex items-center gap-1 text-sm font-medium ${
                isDarkMode
                  ? 'bg-[#353945] hover:bg-red-600 text-white'
                  : 'bg-gray-200 hover:bg-red-500 text-gray-800'
              }`}
              title="登出"
            >
              <span role="img" aria-label="logout" className="text-base">🚪</span>
              <span>登出</span>
            </button>
          </div>
          <div className="pt-2 border-t" style={{ borderColor: isDarkMode ? '#353945' : '#e5e7eb' }}>
            <div className={`flex items-center justify-between px-3 py-2 rounded-md transition group ${
              isDarkMode ? 'bg-[#353945] hover:bg-[#404249]' : 'bg-white hover:bg-gray-200'
            }`}>
              <div className="flex items-center">
                <img
                  src={userData?.avatarURL || '/corgi_chat.png'}
                  alt="頭像"
                  className="w-8 h-8 rounded-full object-cover mr-2"
                />
                <div>
                  <div className="text-sm font-semibold">{userData?.nickname || '訪客'}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{userData?.userId || ''}</div>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile-setup')}
                className={`rounded-md px-2 py-1 ml-2 transition text-sm font-medium ${
                  isDarkMode ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                title="編輯資料"
              >
                <span role="img" aria-label="edit" className="text-base">✏️</span>
              </button>
            </div>
          </div>
        </div>
        {/* 使用說明連結 */}
        <div className={`border-b border-gray-200 dark:border-gray-700 ${
          isDarkMode ? 'bg-[#2b2d31]' : 'bg-white'
        }`}>
          <a
            href="https://hackmd.io/@iDOPzzVvRXmRv-muD4xgxQ/SJ_yib31xl"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-[#353945] hover:bg-[#404249] text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <span className="text-xl">📖</span>
            <div>
              <div className="font-medium">使用前請閱讀</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                點擊查看使用說明
              </div>
            </div>
          </a>
        </div>
        {/* Logo */}
        <div className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-[#8ab4f8]' : 'text-blue-600'}`}>Corgi Chat</div>

        {/* 公開聊天室 */}
        <Link
          to="/"
          className={`block px-4 py-2 rounded transition font-medium ${
            isDarkMode
              ? `hover:bg-[#353945] ${isActive('/') ? 'bg-[#353945]' : ''}`
              : `hover:bg-gray-200 ${isActive('/') ? 'bg-gray-200' : ''}`
          }`}
        >
          🏠 公開聊天室
        </Link>

        {/* 建立聊天室 */}
        <button
          onClick={() => setShowModal(true)}
          className={`block text-left px-4 py-2 rounded transition font-medium ${
            isDarkMode ? 'hover:bg-[#353945]' : 'hover:bg-gray-200'
          }`}
        >
          ➕ 建立聊天室
        </button>

        {/* 我的聊天室清單 */}
        {userData && userData.uid && (
          <button
            onClick={() => navigate(`/chatroom/ai-${userData.uid}`)}
            className={`w-full text-left px-3 py-1.5 rounded text-sm font-bold mb-2 relative overflow-hidden group transition ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#5865F2] to-[#7f8cff] text-white'
                : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
            }`}
          >
            <span className="shine-effect pointer-events-none absolute top-0 left-[-60%] w-2/3 h-full opacity-0 group-hover:opacity-100"></span>
            <span className="relative z-10">🤖 AI 聊天室</span>
          </button>
        )}
        <div className="mt-6 flex-1 overflow-y-auto">
          <h3 className={`text-xs uppercase mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>我的聊天室</h3>
          <div className="space-y-1">
            {myChatrooms.filter(room => room.type !== 'ai').length > 0 ? (
              myChatrooms.filter(room => room.type !== 'ai').map((room) => (
                <button
                  key={room.id}
                  onClick={() => navigate(`/chatroom/${room.id}`)}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm truncate transition font-medium ${
                    isDarkMode
                      ? `hover:bg-[#353945] ${location.pathname === `/chatroom/${room.id}` ? 'bg-[#353945]' : ''}`
                      : `hover:bg-gray-200 ${location.pathname === `/chatroom/${room.id}` ? 'bg-gray-200' : ''}`
                  }`}
                >
                  {room.name}
                </button>
              ))
            ) : (
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>尚未加入任何聊天室</p>
            )}
          </div>
        </div>
      </div>

      {/* 建立聊天室 Modal */}
      {showModal && (
        <CreateChatRoomModal onClose={() => setShowModal(false)} />
      )}

      <style>{`
@keyframes shine-move {
  0% { left: -60%; opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { left: 110%; opacity: 0; }
}
.shine-effect {
  background: linear-gradient(120deg, transparent 0%, white 60%, transparent 100%);
  filter: blur(2px);
  transition: opacity 0.2s;
}
.group:hover .shine-effect {
  animation: shine-move 0.7s linear;
}
`}</style>
    </>
  );
};

export default Sidebar;
