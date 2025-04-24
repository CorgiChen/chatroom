import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import MessageList from './MessageList';

const PublicChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [userMap, setUserMap] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedMessages = [];
      const userIds = new Set();

      snapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() });
        userIds.add(doc.data().uid);
      });

      setMessages(fetchedMessages);

      // 用 functional updater 避免 useEffect 對 userMap 產生依賴
      setUserMap((prevMap) => {
        const updatedMap = { ...prevMap };
        const fetchPromises = [];

        for (const uid of userIds) {
          if (!updatedMap[uid]) {
            const fetchPromise = getDoc(doc(db, 'users', uid)).then((userSnap) => {
              if (userSnap.exists()) {
                updatedMap[uid] = userSnap.data();
              }
            });
            fetchPromises.push(fetchPromise);
          }
        }

        Promise.all(fetchPromises).then(() => {
          setUserMap({ ...updatedMap });
        });

        return prevMap;
      });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const currentDate = new Date();
    const timestamp = currentDate.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    await addDoc(collection(db, 'messages'), {
      uid: auth.currentUser.uid,
      text: message,
      createdAt: serverTimestamp(),
      time: timestamp,
    });

    setMessage('');
  };

  const handleUnsend = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (err) {
      console.error('Error deleting message: ', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageList
          messages={messages}
          userMap={userMap}
          currentUid={auth.currentUser?.uid}
          onUnsend={handleUnsend}
        />
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

export default PublicChatRoom;
 