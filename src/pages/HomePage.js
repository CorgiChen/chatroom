import React from 'react';
import { auth } from '../firebase';

const HomePage = () => {
  const user = auth.currentUser;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        歡迎回來，{user?.displayName || user?.email} 👋
      </h1>

      <div className="bg-white/10 backdrop-blur p-6 rounded-xl text-sm space-y-2">
        <p><strong>Email：</strong>{user?.email}</p>
        <p><strong>使用者 ID：</strong>{user?.uid}</p>
        {/* 若你有另外從 Firestore 讀入 nickname、bio 等，可以加入 */}
      </div>
    </div>
  );
};

export default HomePage;
