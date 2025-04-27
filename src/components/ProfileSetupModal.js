import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { cityData } from '../data/cityData';

const ProfileSetupModal = ({ open, onClose, userData }) => {
  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');
  const [availableAreas, setAvailableAreas] = useState([]);
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (userData) {
      setUid(userData.uid || '');
      setEmail(userData.email || '');
      setUserId(userData.userId || '');
      setNickname(userData.nickname || '');
      setPhone(userData.phone || '');
      setBio(userData.bio || '');
      if (userData.address) {
        const [c, a, ...s] = userData.address.split(/(市|縣|區|鄉|鎮)/).filter(Boolean);
        setCity(c + (s[0] === '市' || s[0] === '縣' ? s.shift() : ''));
        setArea(a + (s[0] === '區' || s[0] === '鄉' || s[0] === '鎮' ? s.shift() : ''));
        setStreet(s.join(''));
        setAvailableAreas(cityData[c + (s[0] === '市' || s[0] === '縣' ? s[0] : '')] || []);
      }
      if (userData.avatarURL) {
        setAvatarPreview(userData.avatarURL);
      }
    } else {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) return;
        setUid(currentUser.uid);
        setEmail(currentUser.email);
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserId(data.userId || '');
          setNickname(data.nickname || '');
          setPhone(data.phone || '');
          setBio(data.bio || '');
          if (data.address) {
            const [c, a, ...s] = data.address.split(/(市|縣|區|鄉|鎮)/).filter(Boolean);
            setCity(c + (s[0] === '市' || s[0] === '縣' ? s.shift() : ''));
            setArea(a + (s[0] === '區' || s[0] === '鄉' || s[0] === '鎮' ? s.shift() : ''));
            setStreet(s.join(''));
            setAvailableAreas(cityData[c + (s[0] === '市' || s[0] === '縣' ? s[0] : '')] || []);
          }
          if (data.avatarURL) {
            setAvatarPreview(data.avatarURL);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [open, userData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!nickname.trim()) {
      setError('暱稱為必填欄位');
      return;
    }
    let avatarURL = avatarPreview;
    if (avatarFile) {
      const fileRef = ref(storage, `avatars/${uid}`);
      await uploadBytes(fileRef, avatarFile);
      avatarURL = await getDownloadURL(fileRef);
    }
    const fullAddress = city && area ? `${city}${area}${street}` : '';
    await setDoc(doc(db, 'users', uid), {
      email,
      userId,
      nickname,
      phone,
      address: fullAddress,
      bio,
      avatarURL,
    });
    alert('資料已儲存');
    if (onClose) onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#232428] rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
          onClick={onClose}
        >✖</button>
        <h2 className="text-2xl font-bold mb-6 text-center">設定個人資料</h2>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block mb-1 font-semibold">Email</label>
            <input type="text" disabled value={email} className="w-full px-4 py-2 border rounded bg-gray-100 text-gray-700" />
          </div>
          <div>
            <label className="block mb-1 font-semibold">使用者 ID</label>
            <input type="text" disabled value={userId} className="w-full px-4 py-2 border rounded bg-gray-100 text-gray-700" />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-red-600">暱稱（必填）</label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} required className="w-full px-4 py-2 border rounded bg-[#232428] text-white" />
          </div>
          <div>
            <label className="block mb-1 font-semibold">電話（選填）</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2 border rounded bg-[#232428] text-white" />
          </div>
          {/* 地址選單組合 */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 font-semibold">縣市</label>
              <select
                value={city}
                onChange={e => {
                  setCity(e.target.value);
                  setAvailableAreas(cityData[e.target.value] || []);
                  setArea('');
                }}
                className="w-full px-4 py-2 border rounded bg-[#232428] text-white"
              >
                <option value="">請選擇</option>
                {Object.keys(cityData).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold">地區</label>
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full px-4 py-2 border rounded bg-[#232428] text-white"
                disabled={!city}
              >
                <option value="">請選擇</option>
                {availableAreas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold">街道</label>
              <input
                type="text"
                value={street}
                onChange={e => setStreet(e.target.value)}
                className="w-full px-4 py-2 border rounded bg-[#232428] text-white"
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold">自我介紹（選填）</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-4 py-2 border rounded bg-[#232428] text-white"
              rows={2}
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">頭像上傳（選填）</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {avatarPreview && <img src={avatarPreview} alt="頭像預覽" className="w-24 h-24 mt-2 rounded-full object-cover" />}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold">
            儲存
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupModal; 