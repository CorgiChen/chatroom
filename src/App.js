import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './components/MainLayout';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import PublicChatRoom from './pages/PublicChatRoom';
import ChatRoomPage from './pages/ChatRoomPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile-setup" element={<ProfileSetupPage />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<PublicChatRoom />} />
          <Route path="chatroom/:chatroomId" element={<ChatRoomPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
