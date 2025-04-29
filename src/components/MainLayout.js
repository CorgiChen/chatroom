// ✅ 改好的 MainLayout.js（手機版 Sidebar/MemberList 互斥顯示 + 背景可點關閉 + 中央內容限制寬度）

import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, getDocs, collection, setDoc, addDoc } from 'firebase/firestore';
import Sidebar from './Sidebar';
import MemberList from './MemberList';
import { useTheme } from '../context/ThemeContext';

const MainLayout = () => {
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1176);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();

  const chatroomId = location.pathname.startsWith('/chatroom/')
    ? location.pathname.split('/chatroom/')[1]
    : null;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1176);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setLoading(false);
      if (!currentUser) {
        navigate('/signin');
        return;
      }

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (!data.nickname) {
          navigate('/profile-setup');
        } else {
          setUserData({ uid: currentUser.uid, ...data });
          // 自動建立 AI 聊天室
          const aiRoomId = `ai-${currentUser.uid}`;
          const aiRoomRef = doc(db, 'chatrooms', aiRoomId);
          const aiRoomSnap = await getDoc(aiRoomRef);
          if (!aiRoomSnap.exists()) {
            await setDoc(aiRoomRef, {
              name: 'AI 聊天室',
              members: [currentUser.uid],
              type: 'ai',
              createdAt: new Date()
            });
            // 新增預設訊息
            const aiMsgRef = collection(db, 'chatrooms', aiRoomId, 'messages');
            await addDoc(aiMsgRef, {
              uid: 'bot',
              text: '嗨！我是 CORGI AI，有什麼我可以幫忙的嗎？',
              createdAt: new Date()
            });
          }
        }
      }

      const querySnap = await getDocs(collection(db, 'users'));
      const users = [];
      querySnap.forEach((doc) => {
        users.push({ uid: doc.id, ...doc.data() });
      });
      setAllUsers(users);
    });
    return () => unsubscribe();
  }, [navigate]);

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
    setShowMembers(false);
  };

  const toggleMembers = () => {
    setShowMembers((prev) => !prev);
    setShowSidebar(false);
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-white text-lg">載入中...</div>;

  return (
    <div className={`relative flex h-[100dvh] ${
      isDarkMode 
        ? 'bg-gradient-to-br from-[#1a1b1e] to-[#2d2f34] text-white' 
        : 'bg-gradient-to-br from-gray-100 to-white text-gray-800'
    } overflow-hidden transition-colors duration-300`}>
      {/* 主題切換按鈕 */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-50 p-2 rounded-full shadow-lg transition-colors ${
          isDarkMode 
            ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }`}
      >
        {isDarkMode ? '🌙' : '☀️'}
      </button>

      {isMobile && !showSidebar && !showMembers && (
        <>
          <button
            onClick={toggleSidebar}
            className={`fixed bottom-48 left-4 z-40 px-4 py-2 text-xl rounded-full shadow-lg transition-colors ${
              isDarkMode 
                ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            ☰
          </button>
          <button
            onClick={toggleMembers}
            className={`fixed bottom-48 right-4 z-40 px-4 py-2 text-xl rounded-full shadow-lg transition-colors ${
              isDarkMode 
                ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            👥
          </button>
        </>
      )}

      {/* 🔸 Sidebar（桌機固定，手機懸浮） */}
      {(isMobile && showSidebar) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30" onClick={() => setShowSidebar(false)}>
          <div className={`absolute left-0 top-0 bottom- w-60 h-full shadow-2xl ${
            isDarkMode ? 'bg-[#2b2d31]' : 'bg-white'
          }`} onClick={(e) => e.stopPropagation()}>
            {userData ? <Sidebar userData={userData} /> : <p className='text-gray-400 text-sm'>載入中...</p>}
          </div>
        </div>
      )}
      {!isMobile && (
        <aside className={`md:flex md:w-60 flex-col border-r ${
          isDarkMode ? 'bg-[#2b2d31] border-[#1f2023]' : 'bg-white border-gray-200'
        }`}>
          <Sidebar userData={userData} />
        </aside>
      )}

      {/* 中間內容區（限制寬度） */}
      <main className="flex-1 flex flex-col max-w-full relative md:pt-0 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="max-w-[800px] w-full mx-auto flex flex-col min-h-full px-4">
            <Outlet />
          </div>
        </div>
      </main>

      {/* 🔹 MemberList（桌機固定，手機懸浮） */}
      {(isMobile && showMembers) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 flex justify-end" onClick={() => setShowMembers(false)}>
          <div className={`h-full w-60 shadow-2xl ${
            isDarkMode ? 'bg-[#2b2d31]' : 'bg-white'
          }`} onClick={(e) => e.stopPropagation()}>
            {userData ? (
              <MemberList
                allUsers={allUsers}
                currentNickname={userData.nickname}
                chatroomId={chatroomId}
              />
            ) : <p className='text-gray-400 text-sm'>載入中...</p>}
          </div>
        </div>
      )}
      {!isMobile && (
        <aside className={`md:block w-70 border-l overflow-y-auto ${
          isDarkMode ? 'bg-[#2b2d31] border-[#1f2023]' : 'bg-white border-gray-200'
        }`}>
          <MemberList
            allUsers={allUsers}
            currentNickname={userData?.nickname}
            chatroomId={chatroomId}
          />
        </aside>
      )}
    </div>
  );
};

export default MainLayout;
