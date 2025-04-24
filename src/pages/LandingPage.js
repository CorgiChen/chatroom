import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center text-white flex flex-col"
      style={{ backgroundImage: "url('/background.jpeg')" }}
    >
      {/* 導覽列 */}
      <header className="flex justify-between items-center px-6 py-4 bg-black/30 backdrop-blur-[1px]">
        <div className="flex items-center space-x-3">
          <img src="/corgi_chat.png" alt="Corgi Chat Logo" className="w-10 h-10" />
          <span className="text-xl font-bold tracking-wide">Corgi Chat</span>
        </div>
        <div className="space-x-4">
          <Link
            to="/signin"
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            登入
          </Link>
          <Link
            to="/signup"
            className="bg-transparent text-white border border-blue-500 px-4 py-2 rounded-full text-sm font-medium hover:bg-white hover:text-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
            註冊
          </Link>
        </div>
      </header>

      {/* 主體內容 */}
      <main className="flex flex-col-reverse md:flex-row items-center justify-center flex-1 px-6 py-16 md:px-20 space-y-12 md:space-y-0 md:space-x-16 bg-black/30 backdrop-blur-[1px]">
        <div className="max-w-lg text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-blue-200 drop-shadow">
            即使跨越銀河也能與你連線
          </h1>
          <p className="text-gray-300 text-lg mb-6 drop-shadow">
            Corgi Chat 是宇宙中最溫暖的即時通訊平台，為你與好友搭起星際之橋。
          </p>
          <div className="flex justify-center md:justify-start space-x-4">
            <Link
              to="/signup"
              className="bg-blue-500 px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              加入我們
            </Link>
            <Link
              to="/signin"
              className="bg-transparent text-white border border-blue-500 px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
              我已有帳號
            </Link>

          </div>
        </div>
      </main>

      {/* 頁尾 */}
      <footer className="text-center text-sm text-gray-300 py-4 bg-black/30 backdrop-blur-[1px]">
        © 2025 Corgi Chat — 在宇宙中與你連線
      </footer>
    </div>
  );
};

export default LandingPage;
