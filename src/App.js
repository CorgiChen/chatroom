import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import HomePage from './pages/HomePage';
import ChatRoom from './pages/ChatRoom';
import ProfileSetupPage from './pages/ProfileSetupPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 不需要三欄的登入/註冊頁 */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile-setup" element={<ProfileSetupPage />} />

        {/* 需要三欄布局的頁面 */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="chat" element={<ChatRoom />} />
          {/* 你可以加更多子頁面，如公告、私訊等 */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
