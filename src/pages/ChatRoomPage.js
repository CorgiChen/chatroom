import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  updateDoc,
  arrayRemove,
} from 'firebase/firestore';
import { db, auth } from '../firebase';

const ChatRoomPage = () => {
  const { chatroomId } = useParams();
  const navigate = useNavigate();
  const currentUid = auth.currentUser?.uid;

  const [chatroom, setChatroom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchChatroom = async () => {
      const roomRef = doc(db, 'chatrooms', chatroomId);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        alert('聊天室不存在');
        return navigate('/');
      }

      const data = roomSnap.data();
      if (!data.members.includes(currentUid)) {
        alert('你已不在此聊天室中');
        return navigate('/');
      }

      setChatroom(data);

      // 載入對照用的成員資料
      const userDocs = await getDocs(collection(db, 'users'));
      const map = {};
      userDocs.forEach((doc) => {
        const u = doc.data();
        map[doc.id] = u;
      });
      setUserMap(map);
    };

    fetchChatroom();
  }, [chatroomId, currentUid, navigate]);

  useEffect(() => {
    const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatroomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages');
    await addDoc(messagesRef, {
      uid: currentUid,
      text: message.trim(),
      createdAt: serverTimestamp(),
    });

    setMessage('');
  };

  const handleLeaveChatroom = async () => {
    const confirmLeave = window.confirm('你確定要離開這個聊天室嗎？');
    if (!confirmLeave) return;

    const roomRef = doc(db, 'chatrooms', chatroomId);
    await updateDoc(roomRef, {
      members: arrayRemove(currentUid),
    });

    alert('你已離開聊天室');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#2b2d31] p-4 text-white font-bold text-xl border-b border-gray-700 flex justify-between items-center">
        <span>{chatroom?.name || '聊天室'}</span>
        <button
          onClick={handleLeaveChatroom}
          className="text-sm text-red-400 hover:text-red-500"
        >
          離開聊天室
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1e1f22]">
        {messages.map((msg) => {
          const isSelf = msg.uid === currentUid;
          const sender = userMap[msg.uid] || {};
          return (
            <div
              key={msg.id}
              className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  isSelf ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                }`}
              >
                <div className="text-xs font-semibold mb-1">
                  {sender.nickname || '使用者'}{' '}
                  <span className="text-gray-300">{sender.userId || ''}</span>
                </div>
                <div className="text-sm whitespace-pre-line">{msg.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 border-t border-gray-700 flex space-x-2 bg-[#2b2d31]"
      >
        <input
          type="text"
          placeholder="輸入訊息..."
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring focus:ring-blue-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          發送
        </button>
      </form>
    </div>
  );
};

export default ChatRoomPage;
