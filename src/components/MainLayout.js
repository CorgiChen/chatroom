// ✅ 改好的 MainLayout.js（手機版 Sidebar/MemberList 互斥顯示 + 背景可點關閉 + 中央內容限制寬度）

import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import Sidebar from './Sidebar';
import MemberList from './MemberList';

const MainLayout = () => {
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1176);

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
    const fetchData = async () => {
      const currentUser = auth.currentUser;
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
          setUserData(data);
        }
      }

      const querySnap = await getDocs(collection(db, 'users'));
      const users = [];
      querySnap.forEach((doc) => {
        users.push({ uid: doc.id, ...doc.data() });
      });
      setAllUsers(users);
    };

    fetchData();
  }, [navigate]);

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
    setShowMembers(false);
  };

  const toggleMembers = () => {
    setShowMembers((prev) => !prev);
    setShowSidebar(false);
  };

  return (
    <div className="relative flex h-screen bg-[#1e1f22] text-white overflow-hidden">
      {/* 🔸 Sidebar（桌機固定，手機懸浮） */}
      {(isMobile && showSidebar) && (
        <div className="fixed inset-0 bg-black/70 z-30" onClick={() => setShowSidebar(false)}>
          <div className="absolute left-0 top-0 bottom-0 bg-[#2b2d31] w-60 h-full shadow-xl " onClick={(e) => e.stopPropagation()}>
            {userData ? <Sidebar userData={userData} /> : <p className='text-gray-400 text-sm'>載入中...</p>}
          </div>
        </div>
      )}
      {!isMobile && (
        <aside className="md:flex md:w-60 bg-[#2b2d31] flex-col">
          <Sidebar userData={userData} />
        </aside>
      )}


      {/* 中間內容區（限制寬度） */}
      <main className="flex-1 flex flex-col overflow-hidden max-w-full relative pt-[48px] md:pt-0">
        <div className="flex-1 overflow-hidden">
          <div className="max-w-[700px] w-full mx-auto h-full">
            <Outlet />
          </div>
        </div>
        {isMobile && (
        <div className="px-4 pt-2 pb-2 flex items-center justify-between">
          <button onClick={toggleSidebar} className="px-4 py-2 text-xl rounded bg-[#3b3d41] shadow">☰</button>
          <div className="flex-1"></div>
          <button onClick={toggleMembers} className="px-4 py-2 text-xl rounded bg-[#3b3d41] shadow">👥</button>
        </div>
        )}
      </main>

      {/* 🔹 MemberList（桌機固定，手機懸浮） */}
      {(isMobile && showMembers) && (
        <div className="fixed inset-0 bg-black/70 z-30 flex justify-end" onClick={() => setShowMembers(false)}>
          <div className="h-full w-60 bg-[#2b2d31] shadow-xl" onClick={(e) => e.stopPropagation()}>
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
        <aside className="md:block w-70 bg-[#2b2d31] border-l border-gray-700 overflow-y-auto">
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
