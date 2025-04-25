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

const AddUserByIdForm = ({ chatroomId, onSuccess }) => {
  const [inputId, setInputId] = useState('');
  const [status, setStatus] = useState('');

  const handleAdd = async () => {
    const userId = inputId.trim();
    if (!userId.startsWith('#')) {
      setStatus('請輸入正確格式的使用者 ID（例如：#a1B2）');
      return;
    }

    try {
      const q = query(collection(db, 'users'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setStatus('❌ 找不到此 ID 的使用者');
        return;
      }

      const targetUser = snapshot.docs[0];
      const targetUid = targetUser.id;
      const currentUid = auth.currentUser?.uid;

      if (!currentUid) {
        setStatus('⚠️ 尚未登入');
        return;
      }

      const chatroomRef = doc(db, 'chatrooms', chatroomId);
      const chatroomSnap = await getDoc(chatroomRef);
      if (!chatroomSnap.exists()) {
        setStatus('❌ 找不到聊天室');
        return;
      }

      const members = chatroomSnap.data().members || [];

      if (targetUid === currentUid) {
        setStatus('❌ 你不能加入自己');
        return;
      }

      if (members.includes(targetUid)) {
        setStatus('⚠️ 此使用者已在聊天室中');
        return;
      }

      await updateDoc(chatroomRef, {
        members: arrayUnion(targetUid),
      });

      setStatus('✅ 已成功加入聊天室');
      setInputId('');

      if (onSuccess) onSuccess(); // ✅ 通知父層重新抓聊天室資料
    } catch (err) {
      console.error(err);
      setStatus('❌ 發生錯誤，請稍後再試');
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <label className="text-white font-semibold text-sm">透過使用者 ID 加入成員</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          placeholder="#a1B2"
          className="flex-1 px-3 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
        >
          加入
        </button>
      </div>
      {status && <p className="text-xs text-gray-300">{status}</p>}
    </div>
  );
};

export default AddUserByIdForm;
