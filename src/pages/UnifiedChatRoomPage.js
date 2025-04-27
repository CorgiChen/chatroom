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
  where,
  setDoc,
  getDocs,
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
  const chatroomMessagesRef = useRef({});
  const navigateRef = useRef(navigate);

  // 更新 navigateRef
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  // 請求通知權限
  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    // 如果權限是 default，則請求權限
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // 監聽所有聊天室的新消息
  useEffect(() => {
    if (!currentUid) return;

    // 檢查頁面是否可見
    const isPageVisible = () => {
      return document.visibilityState === 'visible';
    };

    // 顯示通知
    const showNotification = (message, roomName, roomId = null) => {
      if (!isPageVisible() && Notification.permission === "granted") {
        try {
          const notification = new Notification('新訊息', {
            body: `[${roomName || (roomId ? '私人聊天室' : '公開聊天室')}] ${message}`,
            icon: '/corgi_chat.png',
            tag: roomId || 'public',
            silent: true,
            renotify: true,
          });

          notification.onclick = function() {
            window.focus();
            if (roomId) {
              window.location.href = `/chatroom/${roomId}`;
            } else {
              window.location.href = '/';
            }
            this.close();
          };

          setTimeout(() => {
            notification.close();
          }, 5000);
        } catch (error) {
          console.error('Error showing notification:', error);
        }
      }
    };

    // 監聽用戶加入的所有聊天室
    const userChatroomsQuery = query(
      collection(db, 'chatrooms'),
      where('members', 'array-contains', currentUid)
    );

    const unsubscribeChatrooms = onSnapshot(userChatroomsQuery, async (snapshot) => {
      const chatroomIds = new Set();
      const chatroomNames = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        chatroomIds.add(doc.id);
        chatroomNames[doc.id] = data.name;
      });

      chatroomIds.forEach((roomId) => {
        if (!chatroomMessagesRef.current[roomId]) {
          const messagesQuery = query(
            collection(db, 'chatrooms', roomId, 'messages'),
            orderBy('createdAt', 'asc')
          );

          chatroomMessagesRef.current[roomId] = onSnapshot(messagesQuery, (snapshot) => {
            const messages = [];
            snapshot.forEach((doc) => {
              messages.push({ id: doc.id, ...doc.data() });
            });

            if (messages.length > 0) {
              const lastMessage = messages[messages.length - 1];
              if (lastMessage.uid !== currentUid) {
                showNotification(lastMessage.text, chatroomNames[roomId] || '私人聊天室', roomId);
              }
            }
          });
        }
      });

      Object.keys(chatroomMessagesRef.current).forEach((roomId) => {
        if (!chatroomIds.has(roomId)) {
          chatroomMessagesRef.current[roomId]();
          delete chatroomMessagesRef.current[roomId];
        }
      });
    });

    // 監聽公開聊天室
    const publicMessagesQuery = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribePublic = onSnapshot(publicMessagesQuery, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });

      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.uid !== currentUid) {
          showNotification(lastMessage.text, '公開聊天室');
        }
      }
    });

    // 保存當前的監聽器引用
    const currentListeners = chatroomMessagesRef.current;

    return () => {
      unsubscribeChatrooms();
      unsubscribePublic();
      // 清理所有聊天室的監聽器
      Object.values(currentListeners).forEach(unsubscribe => unsubscribe());
    };
  }, [currentUid]);

  // 獲取當前聊天室的消息
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

    // AI 聊天室判斷
    if (chatroomId === `ai-${currentUid}`) {
      // /vip 指令：啟用本日無限次發問
      if (message.trim() === '/vip') {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem('corgi_ai_vip', today);
        setMessage('');
        const msgsRef = collection(db, 'chatrooms', chatroomId, 'messages');
        await addDoc(msgsRef, {
          uid: 'bot',
          text: '已啟用 VIP 模式，今天可以無限次發問！',
          createdAt: serverTimestamp(),
        });
        return;
      }
      // /clear 指令：清空所有訊息（完全清空，不補預設訊息）
      if (message.trim() === '/clear') {
        const msgsRef = collection(db, 'chatrooms', chatroomId, 'messages');
        const msgsSnap = await getDocs(msgsRef);
        for (const docSnap of msgsSnap.docs) {
          await deleteDoc(docSnap.ref);
        }
        setMessage('');
        return;
      }
      // /help 指令：補上一則預設訊息
      if (message.trim() === '/help') {
        const msgsRef = collection(db, 'chatrooms', chatroomId, 'messages');
        await addDoc(msgsRef, {
          uid: 'bot',
          text: '嗨！我是 CORGI AI，有什麼我可以幫忙的嗎？',
          createdAt: serverTimestamp(),
        });
        setMessage('');
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      // 檢查 VIP 狀態
      const isVip = localStorage.getItem('corgi_ai_vip') === today;
      const userRef = doc(db, 'users', currentUid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      let count = 0;
      if (userData.aiMessageDate === today) {
        count = userData.aiMessageCount || 0;
      }
      if (!isVip && count >= 15) {
        alert('你今天已經對 AI 發送 15 則訊息，請明天再試！');
        return;
      }
      // 1. 先寫入自己的訊息
      await addDoc(collection(db, 'chatrooms', chatroomId, 'messages'), {
        uid: currentUid,
        text: message.trim(),
        createdAt: serverTimestamp(),
      });
      setMessage('');
      // 2. 呼叫 Gemini API
      try {
        const response = await fetch(
          'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=AIzaSyA_6-h11llyDRqdq5etaMpoXiNmaS_ni4Q',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: '請用繁體中文（zh-tw）並使用台灣常用語氣回覆以下問題。' },
                    { text: message.trim() }
                  ]
                }
              ]
            }),
          }
        );
        const data = await response.json();
        console.log(data); // debug 用
        const prefix = Math.random() < 0.5 ? '汪' : '汪汪';
        const aiReply =
          prefix + (
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            data.error?.message ||
            'AI 無法回應'
          );
        // 3. 寫入 AI 回覆
        await addDoc(collection(db, 'chatrooms', chatroomId, 'messages'), {
          uid: 'bot',
          text: aiReply,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        await addDoc(collection(db, 'chatrooms', chatroomId, 'messages'), {
          uid: 'bot',
          text: 'AI 回覆失敗，請稍後再試',
          createdAt: serverTimestamp(),
        });
      }
      // 4. 更新今日次數
      await setDoc(userRef, {
        ...userData,
        aiMessageDate: today,
        aiMessageCount: count + 1
      }, { merge: true });
      return;
    }

    // 一般聊天室/公開聊天室
    const textToSend = message.trim();
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