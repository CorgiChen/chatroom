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
    <div className="min-h-screen bg-cover bg-center text-white flex flex-col items-center justify-start px-6 py-12" style={{ backgroundImage: "url('/background.jpeg')" }}>
      <div className="w-full max-w-2xl bg-white/90 text-gray-800 p-8 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">設定個人資料</h2>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block mb-1 font-semibold">Email</label>
            <input type="text" disabled value={email} className="w-full px-4 py-2 border rounded bg-gray-100" />
          </div>
          <div>
            <label className="block mb-1 font-semibold">使用者 ID</label>
            <input type="text" disabled value={userId} className="w-full px-4 py-2 border rounded bg-gray-100" />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-red-600">暱稱（必填）</label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} required className="w-full px-4 py-2 border rounded" />
          </div>

          <div>
            <label className="block mb-1 font-semibold">電話（選填）</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2 border rounded" />
          </div>

          {/* 地址選單組合 */}
          <div>
            <label className="block mb-1 font-semibold">地址（選填）</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <select
                value={city}
                onChange={(e) => {
                  const selectedCity = e.target.value;
                  setCity(selectedCity);
                  setArea('');
                  setAvailableAreas(cityData[selectedCity] || []);
                }}
                className="px-3 py-2 border rounded sm:w-1/5"
              >
                <option value="">縣/市</option>
                {Object.keys(cityData).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                disabled={!availableAreas.length}
                className="px-3 py-2 border rounded sm:w-1/5"
              >
                <option value="">鄉鎮市區</option>
                {availableAreas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="詳細地址（選填）"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="px-3 py-2 border rounded sm:w-3/5"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold">自我介紹（選填）</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows="3" className="w-full px-4 py-2 border rounded resize-none" />
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

export default ProfileSetupPage;
