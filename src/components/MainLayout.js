
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import Sidebar from './Sidebar';
import MemberList from './MemberList';

const MainLayout = () => {
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
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
    <div className="flex min-h-screen bg-[#1e1f22] text-white">
      <Sidebar userData={userData} />
      <main className="flex-1 px-6 py-8 overflow-y-auto">
        <Outlet />
      </main>
      <MemberList allUsers={allUsers} currentNickname={userData?.nickname} />
    </div>
  );
};

export default MainLayout;
