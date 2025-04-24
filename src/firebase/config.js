adasd// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCDruC3puBO9d_3VVs7uPKXR2rv6gq-_zc",
    authDomain: "ss-chatroom-111034011.firebaseapp.com",
    projectId: "ss-chatroom-111034011",
    storageBucket: "ss-chatroom-111034011.firebasestorage.app",
    messagingSenderId: "453359494681",
    appId: "1:453359494681:web:a932006b44611b56adec88",
    measurementId: "G-C20WV698PL"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
