
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ userData }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const truncateName = (name) => {
    return name && name.length > 5 ? name.slice(0, 5) + '...' : name;
  };

  const navItem = (path, label) => {
    const active = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        className={`px-4 py-2 w-full text-left transition ${active ? 'bg-[#404249] text-white font-semibold' : 'hover:bg-[#404249]'}`}
      >
        {label}
      </button>
    );
  };

  return (
    <aside className="w-60 bg-[#2b2d31] flex flex-col py-6">
      <div className="px-4 mb-4">
        <img src="/corgi_chat.png" alt="Logo" className="w-10 h-10 rounded-full" />
      </div>
      {navItem('/', '# 公開聊天室')}
      {navItem('/chat', '# 私訊')}
      {navItem('/announcements', '# 公告')}

      <div className="mt-auto w-full px-2 pt-4">
        <div className="bg-[#232428] rounded-lg p-2 flex items-center justify-between hover:bg-[#3c3d40] transition">
          <div className="flex items-center space-x-2">
            <img
              src={userData?.avatarURL || '/corgi_chat.png'}
              alt="頭像"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold">{truncateName(userData?.nickname)}</p>
              <p className="text-xs text-gray-400">{userData?.userId}</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full ml-1" title="Online" />
          </div>
          <button
            onClick={() => navigate('/profile-setup')}
            className="text-gray-400 hover:text-white text-lg"
            title="編輯個資"
          >
            ✏️
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
