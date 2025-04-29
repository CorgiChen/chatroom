import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { cityData } from '../data/cityData';
import { useTheme } from '../context/ThemeContext';
import Spinner from '../components/Spinner';

const MAX_AVATAR_SIZE_KB = 200;
const MAX_AVATAR_WIDTH = 256;

function fileToBase64AndCompress(file, maxSizeKB = MAX_AVATAR_SIZE_KB, maxWidth = MAX_AVATAR_WIDTH) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new window.Image();
      img.onload = function () {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((maxWidth / width) * height);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.92;
        let base64 = canvas.toDataURL('image/jpeg', quality);
        while (base64.length / 1024 > maxSizeKB && quality > 0.5) {
          quality -= 0.05;
          base64 = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

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
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarURL, setAvatarURL] = useState('');

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
        setAvatarURL(data.avatarURL || '');
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
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // 驗證暱稱長度
      if (!nickname.trim()) {
        setError('暱稱為必填欄位');
        setSaving(false);
        return;
      }
      if (nickname.length > 8) {
        setError('暱稱不能超過8個字');
        setSaving(false);
        return;
      }
      // 驗證電話格式（可選填）
      if (phone && !/^09\d{8}$/.test(phone)) {
        setError('電話格式錯誤，請輸入09開頭的10碼手機號碼');
        setSaving(false);
        return;
      }
      // 驗證自我介紹長度
      if (bio.length > 30) {
        setError('自我介紹不能超過30字');
        setSaving(false);
        return;
      }
      const fullAddress = city && area ? `${city}${area}${street}` : '';
      console.log('準備寫入 Firestore', { email, userId, nickname, phone, address: fullAddress, bio });
      await setDoc(doc(db, 'users', uid), {
        email,
        userId,
        nickname,
        phone,
        address: fullAddress,
        bio,
        avatarURL,
      });
      console.log('Firestore 寫入完成');
      alert('資料已儲存');
      navigate('/');
    } catch (err) {
      setError('儲存失敗：' + (err.message || err));
      console.error('儲存失敗', err);
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('請選擇圖片檔案');
      return;
    }
    try {
      const base64 = await fileToBase64AndCompress(file);
      setAvatarURL(base64);
      setError('');
    } catch (err) {
      setError('圖片處理失敗，請換一張圖片');
    }
  };

  if (!email && !userId && !nickname && !phone && !bio && !saving) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#18191c] text-white' : 'bg-[#f4f6fa] text-gray-900'}`}>
        <Spinner size={48} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#18191c]' : 'bg-[#f4f6fa]'
    }`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl transition-colors duration-300 ${
        isDarkMode ? 'bg-[#23272f] text-white' : 'bg-white text-gray-900 border border-gray-200'
      }`}>
        <h2 className={`text-2xl font-bold mb-8 text-center tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>設定個人資料</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col items-center mb-2">
            <label className="block font-semibold mb-1">大頭貼（可選，最大200KB）</label>
            <div className="mb-2">
              <img
                src={avatarURL || '/corgi_chat.png'}
                alt="頭像預覽"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {avatarURL && avatarURL.length / 1024 > MAX_AVATAR_SIZE_KB && (
              <p className="text-pink-400 text-xs">圖片已自動壓縮</p>
            )}
          </div>
          <div>
            <label className={`block mb-1 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <input type="text" disabled value={email} className={`w-full px-4 py-2 rounded transition-colors duration-300 ${isDarkMode ? 'bg-[#313338] border border-[#44464b] text-gray-400' : 'bg-gray-100 border border-gray-200 text-gray-500'}`} />
          </div>
          <div>
            <label className={`block mb-1 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>使用者 ID</label>
            <input type="text" disabled value={userId} className={`w-full px-4 py-2 rounded transition-colors duration-300 ${isDarkMode ? 'bg-[#313338] border border-[#44464b] text-gray-400' : 'bg-gray-100 border border-gray-200 text-gray-500'}`} />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-pink-400">暱稱（必填）</label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} required maxLength={8} className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-2 transition-colors duration-300 ${isDarkMode ? 'bg-[#313338] border border-[#44464b] text-white focus:ring-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:ring-blue-400'}`} />
          </div>
          <div>
            <label className={`block mb-1 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>電話（選填）</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} maxLength={10} className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-2 transition-colors duration-300 ${isDarkMode ? 'bg-[#313338] border border-[#44464b] text-white focus:ring-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:ring-blue-400'}`} />
          </div>
          {/* 地址選單組合 */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={`block mb-1 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>縣市</label>
              <select
                value={city}
                onChange={e => {
                  setCity(e.target.value);
                  setAvailableAreas(cityData[e.target.value] || []);
                  setArea('');
                }}
                className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-2 transition-colors duration-300 ${isDarkMode ? 'bg-[#313338] border border-[#44464b] text-white focus:ring-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:ring-blue-400'}`}
              >
                <option value="">請選擇</option>
                {Object.keys(cityData).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={`block mb-1 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>地區</label>
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-2 transition-colors duration-300 ${isDarkMode ? 'bg-[#313338] border border-[#44464b] text-white focus:ring-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:ring-blue-400'}`}
                disabled={!city}
              >
                <option value="">請選擇</option>
                {availableAreas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={`block mb-1 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>街道</label>
              <input
                type="text"
                value={street}
                onChange={e => setStreet(e.target.value)}
                className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-2 transition-colors duration-300 ${isDarkMode ? 'bg-[#313338] border border-[#44464b] text-white focus:ring-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:ring-blue-400'}`}
              />
            </div>
          </div>
          <div>
            <label className={`block mb-1 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>自我介紹（選填）</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={30}
              className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-2 transition-colors duration-300 ${isDarkMode ? 'bg-[#313338] border border-[#44464b] text-white focus:ring-blue-500' : 'bg-white border border-gray-300 text-gray-900 focus:ring-blue-400'}`}
              rows={2}
            />
          </div>
          {error && <p className="text-pink-400 text-sm font-semibold">{error}</p>}
          <button type="submit" className={`w-full py-2 rounded font-bold shadow transition-colors duration-300 ${isDarkMode ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`} disabled={saving}>
            {saving ? '儲存中...' : '儲存'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
