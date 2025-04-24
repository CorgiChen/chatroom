import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const SignInPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (!methods.includes('password')) {
        setError('此 Email 尚未註冊或已使用 Google 登入');
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists() || !docSnap.data().nickname) {
        navigate('/profile-setup');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setError('密碼錯誤，請再試一次');
      } else {
        setError('登入失敗：' + err.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      const uid = auth.currentUser.uid;
      const email = auth.currentUser.email;
  
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
  
      if (!docSnap.exists()) {
        // 🔹 產生 userId 並初始化儲存資料
        const generateUserId = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let id = '#';
          for (let i = 0; i < 4; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return id;
        };
  
        const userId = generateUserId();
  
        await setDoc(userRef, {
          email,
          userId
        });
  
        // 跳轉去補個人資料
        navigate('/profile-setup');
      } else if (!docSnap.data().nickname) {
        navigate('/profile-setup');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('你關閉了 Google 登入視窗，請再試一次');
      } else {
        setError('Google 登入失敗：' + err.message);
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white flex flex-col"
      style={{ backgroundImage: "url('/background.jpeg')" }}
    >
      <header className="flex justify-between items-center px-6 py-4 bg-black/15">
        <Link to="/signin" className="flex items-center space-x-3 hover:opacity-80 transition">
          <img src="/corgi_chat.png" alt="Corgi Chat Logo" className="w-10 h-10" />
          <span className="text-xl font-bold tracking-wide">Corgi Chat</span>
        </Link>
      </header>

      <main className="flex flex-col md:flex-row items-center justify-center gap-y-12 flex-1 px-6 md:px-24 py-12 bg-black/15">
        {/* 左側說明 */}
        <div className="max-w-md md:max-w-lg text-center md:text-left md:mr-16">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-blue-200 drop-shadow">
            跨越銀河也能與你連線
          </h1>
          <p className="text-base md:text-lg text-gray-300 drop-shadow">
            Corgi Chat 是宇宙中最溫暖的即時通訊平台，為你與好友搭起星際之橋。
          </p>
        </div>

        {/* 右側登入卡片 */}
        <div className="w-full max-w-md bg-white bg-opacity-90 p-6 sm:p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">登入 Corgi Chat</h2>
          <form onSubmit={handleSignIn} className="space-y-4">
            <input
              type="email"
              placeholder="帳號（Email 或 ID）"
              className="w-full px-4 py-2 border rounded-lg text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="密碼"
              className="w-full px-4 py-2 border rounded-lg text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
            >
              登入
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center w-full bg-white border border-gray-300 rounded-lg py-2 hover:shadow-md transition"
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google Logo"
                className="w-5 h-5 mr-3"
              />
              <span className="text-sm font-medium text-gray-700">使用 Google 帳號登入</span>
            </button>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-red-500 whitespace-pre-wrap">
              {error}
            </p>
          )}

          <p className="mt-6 text-sm text-center text-gray-700">
            還沒有帳號？<Link to="/signup" className="text-blue-500 hover:underline">註冊</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignInPage;
