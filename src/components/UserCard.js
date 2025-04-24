import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const UserHoverCard = ({ user }) => {
  const navigate = useNavigate();
  const currentUid = auth.currentUser?.uid;

  if (!user) return null;

  const handleDM = () => {
    navigate(`/dm/${user.uid}`);
  };

  return (
    <div className="bg-[#2b2d31] text-white p-6 rounded-2xl shadow-xl w-72 space-y-3">
      <div className="flex flex-col items-center">
        <img
          src={user.avatarURL || '/corgi_chat.png'}
          alt="頭像"
          className="w-20 h-20 rounded-full object-cover mb-2"
        />
        <div className="text-lg font-bold">{user.nickname || '使用者'}</div>
        <div className="text-sm text-gray-400">{user.userId || ''}</div>
      </div>

      {user.introduction && (
        <div className="text-sm text-gray-300 mt-2 whitespace-pre-line">
          {user.introduction}
        </div>
      )}

      {user.uid !== currentUid && (
        <button
          onClick={handleDM}
          className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          ✉️ 私訊
        </button>
      )}
    </div>
  );
};

export default UserHoverCard;
