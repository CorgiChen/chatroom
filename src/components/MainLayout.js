import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import Sidebar from './Sidebar';
import MemberList from './MemberList';

const MainLayout = () => {
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMemberList, setShowMemberList] = useState(false);
  const navigate = useNavigate();

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
        users.push(doc.data());
      });
      setAllUsers(users);
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-[#1e1f22] text-white">
      {/* 手機上方 bar */}
      <div className="md:hidden flex justify-between items-center p-3 bg-[#2b2d31] shadow-md">
        <button onClick={() => setShowSidebar(!showSidebar)} className="text-white text-xl">
          ☰
        </button>
        <span className="font-bold text-lg">Corgi Chat</span>
        <button onClick={() => setShowMemberList(!showMemberList)} className="text-white text-xl">
          👥
        </button>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`${showSidebar ? 'block' : 'hidden'} md:block`}>
          <Sidebar userData={userData} />
        </div>

        {/* 中間主要畫面：顯示 PublicChatRoom 或 ChatRoomPage */}
        <main className="flex-1 px-4 py-6 overflow-y-auto">
          <Outlet />
        </main>

        {/* 成員列表 */}
        <div className={`${showMemberList ? 'block' : 'hidden'} md:block`}>
          <MemberList allUsers={allUsers} currentNickname={userData?.nickname} />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
