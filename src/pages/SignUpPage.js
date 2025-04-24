import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
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
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const userId = await getUniqueUserId();
      await setDoc(doc(db, 'users', uid), {
        email,
        userId,
        nickname,
        phone,
        address,
      });
      alert(`註冊成功！你的使用者 ID 是：${userId}`);
      navigate('/signin');
    } catch (err) {
      setError('註冊失敗：' + err.message);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white flex flex-col items-center relative"
      style={{ backgroundImage: "url('/background.jpeg')" }}
    >
      {/* 背景遮罩層 */}
      <div className="absolute inset-0 bg-black/15 z-0" />

      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 z-10">
        <Link to="/signin" className="flex items-center space-x-3 hover:opacity-80 transition">
          <img src="/corgi_chat.png" alt="Corgi Chat Logo" className="w-10 h-10" />
          <span className="text-xl font-bold tracking-wide">Corgi Chat</span>
        </Link>
      </header>

      {/* 標語 */}
      <section className="text-center mt-16 md:mt-14 px-6 z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-200 drop-shadow mb-4">在星際間留的蹤影</h1>
        <p className="text-gray-300 text-lg drop-shadow">加入 Corgi Chat，即使跨越銀河也能與你連線。</p>
      </section>

      {/* 表單卡片 */}
      <section className="w-full max-w-md mt-12 md:mt-12 px-6 z-10">
        <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">註冊 Corgi Chat</h2>
          <form onSubmit={handleSignUp} className="space-y-4">
            <input
              type="email"
              placeholder="帳號（Email）"
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
            <input
              type="text"
              placeholder="暱稱"
              className="w-full px-4 py-2 border rounded-lg text-black"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="電話（選填）"
              className="w-full px-4 py-2 border rounded-lg text-black"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="text"
              placeholder="地址（選填）"
              className="w-full px-4 py-2 border rounded-lg text-black"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
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
