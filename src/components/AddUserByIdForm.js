import React, { useState } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';

const AddUserByIdForm = ({ chatroomId, onSuccess }) => {
  const [inputId, setInputId] = useState('');
  const { isDarkMode } = useTheme();

  const handleAdd = async () => {
    const userId = inputId.trim();
    if (!userId.startsWith('#')) {
      alert('請輸入正確格式的使用者 ID（例如：#a1B2）');
      return;
    }

    try {
      const q = query(collection(db, 'users'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        alert('找不到此 ID 的使用者');
        return;
      }

      const targetUser = snapshot.docs[0];
      const targetUid = targetUser.id;
      const currentUid = auth.currentUser?.uid;

      if (!currentUid) {
        alert('尚未登入');
        return;
      }

      const chatroomRef = doc(db, 'chatrooms', chatroomId);
      const chatroomSnap = await getDoc(chatroomRef);
      if (!chatroomSnap.exists()) {
        alert('找不到聊天室');
        return;
      }

      const members = chatroomSnap.data().members || [];

      if (targetUid === currentUid) {
        alert('你不能加入自己');
        return;
      }

      if (members.includes(targetUid)) {
        alert('此使用者已在聊天室中');
        return;
      }

      await updateDoc(chatroomRef, {
        members: arrayUnion(targetUid),
      });

      alert('✅ 已成功加入聊天室');
      setInputId('');
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error(err);
      alert('❌ 發生錯誤，請稍後再試');
    }
  };

  return (
    <div className={`flex flex-col gap-4 max-w-52 p-4 rounded-lg shadow-md mb-2 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#23272f]' : 'bg-white border border-gray-200'
    }`}>
      <label className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>透過使用者 ID 加入成員</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          placeholder="#a1B2"
          className={`max-w-24 flex-1 px-3 py-2 rounded focus:outline-none focus:ring font-medium transition-colors duration-300 ${
            isDarkMode
              ? 'bg-[#353945] text-white placeholder-gray-400 focus:ring-[#5865F2]'
              : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:ring-blue-400'
          }`}
        />
        <button
          type="button"
          onClick={handleAdd}
          className={`px-4 py-2 rounded font-bold transition-colors duration-300 ${
            isDarkMode
              ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          加入
        </button>
      </div>
    </div>
  );
};

export default AddUserByIdForm;
