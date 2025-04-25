import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import Sidebar from './Sidebar';
import MemberList from './MemberList';

const MainLayout = () => {
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 自動抓 chatroomId（如果是私人聊天室）
  const chatroomId = location.pathname.startsWith('/chatroom/')
    ? location.pathname.split('/chatroom/')[1]
    : null;

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

  return (
    <div className="flex h-screen bg-[#1e1f22] text-white overflow-hidden">
      {/* 左側 Sidebar */}
      <aside className="w-60 bg-[#2b2d31] p-2 hidden md:flex flex-col">
        <Sidebar userData={userData} />
      </aside>

      {/* 中間訊息區 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>

      {/* 右側成員列表 */}
      <aside className="w-70 bg-[#2b2d31] border-1 p1 border-gray-700 overflow-y-auto hidden md:block">
        <MemberList
          allUsers={allUsers}
          currentNickname={userData?.nickname}
          chatroomId={chatroomId} // ✅ 正確傳 chatroomId
        />
      </aside>
    </div>
  );
};

export default MainLayout;
