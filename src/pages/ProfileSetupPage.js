import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { cityData } from '../data/cityData';


const ProfileSetupPage = () => {
  const navigate = useNavigate();

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
          const addressMatch = data.address.match(/^(.+[市縣])(.+[區鄉鎮])(.+)?$/);
          if (addressMatch) {
            setCity(addressMatch[1]);
            setArea(addressMatch[2]);
            setStreet(addressMatch[3] || '');
            setAvailableAreas(cityData[addressMatch[1]] || []);
          } else {
            setCity('');
            setArea('');
            setStreet('');
            setAvailableAreas([]);
          }
        }
        if (data.avatarURL) {
          setAvatarPreview(data.avatarURL);
        }
      }
    });

    return () => unsubscribe();
  }, []);

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
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#1e1f22] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#232428] text-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-8 text-center tracking-wide">設定個人資料</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block mb-1 font-semibold text-gray-300">Email</label>
            <input type="text" disabled value={email} className="w-full px-4 py-2 rounded bg-[#313338] border border-[#44464b] text-gray-400" />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-300">使用者 ID</label>
            <input type="text" disabled value={userId} className="w-full px-4 py-2 rounded bg-[#313338] border border-[#44464b] text-gray-400" />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-pink-400">暱稱（必填）</label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} required className="w-full px-4 py-2 rounded bg-[#313338] border border-[#44464b] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-300">電話（選填）</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2 rounded bg-[#313338] border border-[#44464b] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          {/* 地址選單組合 */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-300">縣市</label>
              <select
                value={city}
                onChange={e => {
                  setCity(e.target.value);
                  setAvailableAreas(cityData[e.target.value] || []);
                  setArea('');
                }}
                className="w-full px-4 py-2 rounded bg-[#313338] border border-[#44464b] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">請選擇</option>
                {Object.keys(cityData).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-300">地區</label>
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full px-4 py-2 rounded bg-[#313338] border border-[#44464b] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={!city}
              >
                <option value="">請選擇</option>
                {availableAreas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-300">街道</label>
              <input
                type="text"
                value={street}
                onChange={e => setStreet(e.target.value)}
                className="w-full px-4 py-2 rounded bg-[#313338] border border-[#44464b] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-300">自我介紹（選填）</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#313338] border border-[#44464b] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              rows={2}
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-300">頭像上傳（選填）</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-gray-300" />
            {avatarPreview && <img src={avatarPreview} alt="頭像預覽" className="w-24 h-24 mt-2 rounded-full object-cover border-2 border-[#44464b]" />}
          </div>
          {error && <p className="text-pink-400 text-sm font-semibold">{error}</p>}
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-bold shadow transition">
            儲存
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
