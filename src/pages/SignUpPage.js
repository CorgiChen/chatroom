import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const generateUserId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '#';
    for (let i = 0; i < 4; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  const getUniqueUserId = async () => {
    let unique = false;
    let newId = '';
    while (!unique) {
      newId = generateUserId();
      const q = query(collection(db, 'users'), where('userId', '==', newId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) unique = true;
    }
    return newId;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('密碼與確認密碼不一致');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const userId = await getUniqueUserId();

      await setDoc(doc(db, 'users', uid), {
        email,
        userId,
      });

      alert(`註冊成功！你的使用者 ID 是：${userId}`);
      navigate('/profile-setup');
    } catch (err) {
      setError('註冊失敗：' + err.message);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white flex flex-col items-center relative"
      style={{ backgroundImage: "url('/background.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black/15 z-0" />

      <header className="w-full flex justify-between items-center px-6 py-4 z-10">
        <Link to="/signin" className="flex items-center space-x-3 hover:opacity-80 transition">
          <img src="/corgi_chat.png" alt="Corgi Chat Logo" className="w-10 h-10" />
          <span className="text-xl font-bold tracking-wide">Corgi Chat</span>
        </Link>
      </header>

      <section className="text-center mt-16 md:mt-14 px-6 z-10">
        <h1 className="text-3xl md:text-5xl font-bold text-blue-200 drop-shadow mb-4">在星際間留下蹤影</h1>
        <p className="text-gray-300 text-base md:text-lg drop-shadow">加入 Corgi Chat，即使跨越銀河也能與你連線。</p>
      </section>

      <section className="w-full px-4 sm:px-6 mt-12 md:mt-12 z-10">
        <div className="max-w-md mx-auto bg-white/90 p-6 sm:p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">註冊 Corgi Chat</h2>
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="帳號（Email）"
              className="w-full px-4 py-2 border rounded-md text-black focus:ring-2 focus:ring-blue-300 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="密碼"
              className="w-full px-4 py-2 border rounded-md text-black focus:ring-2 focus:ring-blue-300 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="再次輸入密碼"
              className="w-full px-4 py-2 border rounded-md text-black focus:ring-2 focus:ring-blue-300 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
            >
              註冊
            </button>
          </form>
          {error && (
            <p className="mt-4 text-center text-sm text-red-500 whitespace-pre-wrap">{error}</p>
          )}
          <p className="mt-6 text-sm text-center text-gray-700">
            已經有帳號了？<Link to="/signin" className="text-blue-500 hover:underline">登入</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default SignUpPage;
