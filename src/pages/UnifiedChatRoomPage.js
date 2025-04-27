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
  deleteDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import MessageList from '../components/MessageList';

const UnifiedChatRoomPage = () => {
  const { chatroomId } = useParams();
  const isPublic = !chatroomId;
  const navigate = useNavigate();
  const currentUid = auth.currentUser?.uid;

  const [chatroom, setChatroom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUid) return;

    const fetchData = async () => {
      let q;

      if (isPublic) {
        q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
      } else {
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
        q = query(collection(db, 'chatrooms', chatroomId, 'messages'), orderBy('createdAt', 'asc'));
      }

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const fetchedMessages = [];
        const userIds = new Set();

        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedMessages.push({ id: doc.id, ...data });
          userIds.add(data.uid);
        });

        const map = {};
        for (const uid of userIds) {
          const userSnap = await getDoc(doc(db, 'users', uid));
          if (userSnap.exists()) map[uid] = userSnap.data();
        }

        setUserMap(map);
        setMessages(fetchedMessages);
      });

      return () => unsubscribe();
    };

    fetchData();
  }, [chatroomId, currentUid, navigate, isPublic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
  
    const textToSend = message.trim(); // ✅ 不用做 sanitize
  
    setMessage(''); // 先清空
  
    const collectionRef = isPublic
      ? collection(db, 'messages')
      : collection(db, 'chatrooms', chatroomId, 'messages');
  
    await addDoc(collectionRef, {
      uid: currentUid,
      text: textToSend,
      createdAt: serverTimestamp(),
    });
  };
  

  const handleUnsend = async (messageId) => {
    const ref = isPublic
      ? doc(db, 'messages', messageId)
      : doc(db, 'chatrooms', chatroomId, 'messages', messageId);
    await deleteDoc(ref);
  };

  const chatroomName = isPublic ? '公開聊天室' : chatroom?.name;

  return (
    <div className="flex flex-col h-full bg-[#1e1f22] text-white">
      {/* 上方：聊天室名稱 + 搜尋 */}
      <div className="p-3 border-b border-gray-700 bg-[#2b2d31] flex items-center justify-between">
        <div className="text-lg font-bold text-white md:ml-4">
          {chatroomName}
        </div>
        <div className="w-2/3 flex items-center">
          <input
            type="text"
            placeholder="搜尋訊息..."
            className="w-full px-4 py-2 rounded bg-gray-800 text-white text-sm focus:outline-none focus:ring focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 中間：訊息清單 */}
      <div className="flex-1 overflow-y-auto custom-scroll">
        <MessageList
          messages={messages}
          userMap={userMap}
          currentUid={currentUid}
          onUnsend={handleUnsend}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          chatroomName={chatroomName}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* 底部：加人 + 輸入訊息 */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-gray-700 bg-[#2b2d31] flex items-center gap-2 flex-wrap md:flex-nowrap"
      >
        {/* 邀請 ID 功能（私人聊天室才顯示） */}
        {/* {!isPublic && chatroomId && (
          <div className="w-full md:w-auto">
            <AddUserByIdForm chatroomId={chatroomId} />
          </div>
        )} */}

        {/* 訊息輸入欄 + 發送按鈕 */}
        <div className="flex flex-1 gap-2 w-full">
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
        </div>
      </form>
    </div>
  );
};

export default UnifiedChatRoomPage;