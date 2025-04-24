import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const CreateChatRoomModal = ({ onClose }) => {
  const [chatName, setChatName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUid = auth.currentUser?.uid;

  const handleCreateRoom = async () => {
    setError('');

    if (!chatName.trim()) {
      setError('請輸入聊天室名稱');
      return;
    }

    try {
      const newRoom = {
        name: chatName.trim(),
        members: [currentUid], // ✅ 只加自己
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'chatrooms'), newRoom);
      onClose(); // 關閉 modal
      navigate(`/chatroom/${docRef.id}`); // 導向新聊天室
    } catch (err) {
      console.error(err);
      setError('建立聊天室失敗，請再試一次');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#2b2d31] w-full max-w-md p-6 rounded-lg relative text-white shadow-lg border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-xl"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">建立群組聊天室</h2>

        <input
          type="text"
          placeholder="聊天室名稱"
          className="w-full border border-gray-600 bg-gray-800 text-white px-4 py-2 rounded mb-3 placeholder-gray-400"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
        />

        {error && <p className="text-sm text-red-400 mb-2">{error}</p>}

        <button
          onClick={handleCreateRoom}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          建立聊天室
        </button>
      </div>
    </div>
  );
};

export default CreateChatRoomModal;
