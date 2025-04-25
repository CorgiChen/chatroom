import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './components/MainLayout';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import UnifiedChatRoomPage from './pages/UnifiedChatRoomPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 登入註冊 & 設定頁 */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile-setup" element={<ProfileSetupPage />} />

        {/* 聊天室框架 */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<UnifiedChatRoomPage />} />
          <Route path="chatroom/:chatroomId" element={<UnifiedChatRoomPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
